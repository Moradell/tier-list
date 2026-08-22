import { readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { IncomingMessage } from 'node:http'
import Papa from 'papaparse'
import type { Plugin } from 'vite'
import { BOOK_COLUMNS, BOOK_TIERS, parseBooksCsv, type BookRecord, type BookTier } from '../../src/lib/books.ts'

const categoryFiles = {
  'Роман': 'novels.csv',
  'Рассказ': 'stories.csv',
  'Манга': 'manga.csv',
  'Вне рейтинга': 'unranked.csv',
} as const

const saveQueues = new Map<BookCategory, Promise<void>>()

type BookCategory = keyof typeof categoryFiles

interface OrderItem {
  id: string
  tier: BookTier
}

interface OrderPayload {
  category: BookCategory
  books: OrderItem[]
}

function getBookId(book: BookRecord): string {
  const id = book.url.match(/\/book\/(\d+)/)?.[1]
  if (!id) throw new Error(`Не найден LiveLib ID у ${book.url}`)
  return id
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0

  for await (const chunk of request) {
    const buffer = Buffer.from(chunk)
    size += buffer.length
    if (size > 1_000_000) throw new Error('Слишком большой запрос')
    chunks.push(buffer)
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function parsePayload(value: unknown): OrderPayload {
  if (!value || typeof value !== 'object') throw new Error('Некорректное тело запроса')
  const { category, books } = value as Partial<OrderPayload>
  if (!category || !(category in categoryFiles)) throw new Error('Неизвестная категория книг')
  if (!Array.isArray(books)) throw new Error('Не передан порядок книг')

  const ids = new Set<string>()
  for (const book of books) {
    if (!book || typeof book.id !== 'string' || !BOOK_TIERS.includes(book.tier)) {
      throw new Error('Некорректная книга в порядке')
    }
    if (ids.has(book.id)) throw new Error(`Книга ${book.id} передана дважды`)
    ids.add(book.id)
  }

  return { category, books }
}

async function saveOrder(root: string, payload: OrderPayload): Promise<void> {
  const relativePath = `data/${categoryFiles[payload.category]}`
  const filePath = path.join(root, relativePath)
  const sourceBooks = parseBooksCsv(await readFile(filePath, 'utf8'), relativePath)
  const booksById = new Map(sourceBooks.map((book) => [getBookId(book), book]))

  if (payload.books.length !== sourceBooks.length) throw new Error('Количество книг не совпадает с CSV')
  for (const { id } of payload.books) {
    if (!booksById.has(id)) throw new Error(`Книга ${id} отсутствует в ${relativePath}`)
  }

  const tierPositions = new Map<BookTier, number>()
  const orderedBooks = payload.books.map(({ id, tier }, index) => {
    const sourceBook = booksById.get(id)!
    if (payload.category === 'Вне рейтинга') {
      return { ...sourceBook, position: String(index + 1) }
    }

    const position = (tierPositions.get(tier) ?? 0) + 1
    tierPositions.set(tier, position)
    return { ...sourceBook, tier, position: String(position) }
  })

  const tierRank = new Map(BOOK_TIERS.map((tier, index) => [tier, index]))
  if (payload.category !== 'Вне рейтинга') {
    orderedBooks.sort((left, right) => (
      (tierRank.get(left.tier) ?? 0) - (tierRank.get(right.tier) ?? 0)
      || Number(left.position) - Number(right.position)
    ))
  }

  const csv = Papa.unparse({ fields: [...BOOK_COLUMNS], data: orderedBooks }, { newline: '\n' })
  const temporaryPath = `${filePath}.tmp`
  await writeFile(temporaryPath, `${csv}\n`, 'utf8')
  await rename(temporaryPath, filePath)
}

export function booksApiPlugin(): Plugin {
  return {
    name: 'books-api',
    apply: 'serve',
    handleHotUpdate(context) {
      const isBooksCsv = Object.values(categoryFiles).some((file) => context.file.endsWith(`/data/${file}`))
      if (isBooksCsv) return []
    },
    configureServer(server) {
      server.middlewares.use('/api/books/order', async (request, response) => {
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          const payload = parsePayload(await readJson(request))
          const previousSave = saveQueues.get(payload.category) ?? Promise.resolve()
          const currentSave = previousSave.catch(() => undefined).then(() => saveOrder(server.config.root, payload))
          saveQueues.set(payload.category, currentSave)
          await currentSave
          response.statusCode = 200
          response.end(JSON.stringify({ ok: true }))
        } catch (error) {
          response.statusCode = 400
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
        }
      })
    },
  }
}
