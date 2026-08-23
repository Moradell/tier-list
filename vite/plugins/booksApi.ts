import { randomUUID } from 'node:crypto'
import { readFile, rename, writeFile } from 'node:fs/promises'
import type { IncomingMessage } from 'node:http'
import path from 'node:path'
import type { Plugin } from 'vite'
import {
  parseBookHistory,
  type BookHistoryData,
  type BookHistoryEvent,
} from '../../src/entities/book-history/model/bookHistory.ts'
import { BOOK_TIERS, parseBooksJson, type BookRecord, type BookTier } from '../../src/entities/book/model/books.ts'

const categoryFiles = {
  'Роман': 'books/novels.json',
  'Рассказ': 'books/stories.json',
  'Манга': 'books/manga.json',
  'Вне рейтинга': 'books/unranked.json',
} as const

type BookCategory = keyof typeof categoryFiles

interface OrderItem {
  id: string
  tier: BookTier
}

interface OrderPayload {
  category: BookCategory
  movedBookId: string
  books: OrderItem[]
}

let mutationQueue = Promise.resolve<unknown>(undefined)

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const result = mutationQueue.catch(() => undefined).then(operation)
  mutationQueue = result
  return result
}

function getBookId(book: BookRecord): string {
  const id = book.url.match(/\/book\/(\d+)/)?.[1]
  if (!id) throw new Error(`Не найден LiveLib ID у ${book.url}`)
  return id
}

function createBookSnapshot(book: BookRecord, category: BookCategory) {
  return {
    id: getBookId(book),
    category,
    title: book.title,
    author: book.author,
    cover: book.cover,
    url: book.url,
  }
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
  const { category, movedBookId, books } = value as Partial<OrderPayload>
  if (!category || !(category in categoryFiles)) throw new Error('Неизвестная категория книг')
  if (!movedBookId || typeof movedBookId !== 'string') throw new Error('Не указана перемещённая книга')
  if (!Array.isArray(books)) throw new Error('Не передан порядок книг')

  const ids = new Set<string>()
  for (const book of books) {
    if (!book || typeof book.id !== 'string' || !BOOK_TIERS.includes(book.tier)) {
      throw new Error('Некорректная книга в порядке')
    }
    if (ids.has(book.id)) throw new Error(`Книга ${book.id} передана дважды`)
    ids.add(book.id)
  }
  if (!ids.has(movedBookId)) throw new Error('Перемещённая книга отсутствует в порядке')

  return { category, movedBookId, books }
}

async function readHistory(root: string): Promise<BookHistoryData> {
  const value = JSON.parse(await readFile(path.join(root, 'data/books/history.json'), 'utf8')) as unknown
  return parseBookHistory(value)
}

async function writeHistory(root: string, history: BookHistoryData): Promise<void> {
  const filePath = path.join(root, 'data/books/history.json')
  const temporaryPath = `${filePath}.tmp`
  await writeFile(temporaryPath, `${JSON.stringify(history, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, filePath)
}

async function syncNewBooks(root: string): Promise<{ history: BookHistoryData; newEvents: BookHistoryEvent[] }> {
  const history = await readHistory(root)
  const knownBookIds = new Set(history.knownBookIds)
  const newEvents: BookHistoryEvent[] = []

  for (const [category, file] of Object.entries(categoryFiles) as [BookCategory, string][]) {
    const relativePath = `data/${file}`
    const value = JSON.parse(await readFile(path.join(root, relativePath), 'utf8')) as unknown
    const books = parseBooksJson(value, relativePath)
    for (const book of books) {
      const id = getBookId(book)
      if (knownBookIds.has(id)) continue
      knownBookIds.add(id)
      newEvents.push({
        id: randomUUID(),
        type: 'new',
        book: createBookSnapshot(book, category),
        from: null,
        to: { tier: book.tier, position: Number(book.position) },
        createdAt: new Date().toISOString(),
      })
    }
  }

  if (newEvents.length > 0) {
    history.knownBookIds = [...knownBookIds]
    history.events.push(...newEvents)
    await writeHistory(root, history)
  }
  return { history, newEvents }
}

async function saveOrder(root: string, payload: OrderPayload): Promise<{ event: BookHistoryEvent | null; newEvents: BookHistoryEvent[] }> {
  const { history, newEvents } = await syncNewBooks(root)
  const relativePath = `data/${categoryFiles[payload.category]}`
  const filePath = path.join(root, relativePath)
  const sourceValue = JSON.parse(await readFile(filePath, 'utf8')) as unknown
  const sourceBooks = parseBooksJson(sourceValue, relativePath)
  const booksById = new Map(sourceBooks.map((book) => [getBookId(book), book]))

  if (payload.books.length !== sourceBooks.length) throw new Error('Количество книг не совпадает с файлом данных')
  for (const { id } of payload.books) {
    if (!booksById.has(id)) throw new Error(`Книга ${id} отсутствует в ${relativePath}`)
  }

  const tierPositions = new Map<BookTier, number>()
  const orderedBooks = payload.books.map(({ id, tier }, index) => {
    const sourceBook = booksById.get(id)!
    if (payload.category === 'Вне рейтинга') return { ...sourceBook, position: String(index + 1) }
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

  const temporaryPath = `${filePath}.tmp`
  await writeFile(temporaryPath, `${JSON.stringify(orderedBooks, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, filePath)

  const before = booksById.get(payload.movedBookId)!
  const after = orderedBooks.find((book) => getBookId(book) === payload.movedBookId)!
  const hasMoved = before.tier !== after.tier || before.position !== after.position
  const event: BookHistoryEvent | null = hasMoved ? {
    id: randomUUID(),
    type: 'move',
    book: createBookSnapshot(after, payload.category),
    from: { tier: before.tier, position: Number(before.position) },
    to: { tier: after.tier, position: Number(after.position) },
    createdAt: new Date().toISOString(),
  } : null

  if (event) {
    history.events.push(event)
    await writeHistory(root, history)
  }
  return { event, newEvents }
}

function sendJson(response: import('node:http').ServerResponse, status: number, value: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(value))
}

export function booksApiPlugin(): Plugin {
  return {
    name: 'books-api',
    apply: 'serve',
    handleHotUpdate(context) {
      const dataFiles = [...Object.values(categoryFiles), 'books/history.json']
      if (dataFiles.some((file) => context.file.endsWith(`/data/${file}`))) return []
    },
    configureServer(server) {
      server.middlewares.use('/api/books/order', async (request, response) => {
        if (request.method !== 'POST') return sendJson(response, 405, { error: 'Method not allowed' })
        try {
          const payload = parsePayload(await readJson(request))
          sendJson(response, 200, { ok: true, ...await enqueue(() => saveOrder(server.config.root, payload)) })
        } catch (error) {
          sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) })
        }
      })

      server.middlewares.use('/api/books/history', async (request, response) => {
        if (request.method !== 'GET') return sendJson(response, 405, { error: 'Method not allowed' })
        try {
          const { history } = await enqueue(() => syncNewBooks(server.config.root))
          sendJson(response, 200, history)
        } catch (error) {
          sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) })
        }
      })
    },
  }
}
