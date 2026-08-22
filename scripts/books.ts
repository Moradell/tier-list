import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Papa from 'papaparse'
import { BOOK_COLUMNS, BOOK_TIERS, parseBooksCsv, type BookRecord } from '@entities/book/model/books'
import { parseHistory } from '@entities/history/model/history'

interface BookGroup {
  file: string
  relativePath: string
  books: BookRecord[]
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const files = ['novels.csv', 'stories.csv', 'manga.csv', 'unranked.csv']
const tierOrder = new Map(BOOK_TIERS.map((tier, index) => [tier, index]))

async function loadBooks(): Promise<BookGroup[]> {
  return Promise.all(files.map(async (file) => {
    const relativePath = `data/${file}`
    const csv = await readFile(path.join(root, relativePath), 'utf8')
    return { file, relativePath, books: parseBooksCsv(csv, relativePath) }
  }))
}

function assertNoDuplicates(groups: BookGroup[]): void {
  const seen = new Map<string, string>()
  for (const group of groups) {
    for (const book of group.books) {
      const id = book.url.match(/\/book\/(\d+)/)?.[1]
      if (!id) throw new Error(`Не найден LiveLib ID у ${book.url}`)
      if (seen.has(id)) throw new Error(`Книга ${id} повторяется в ${seen.get(id)} и ${group.relativePath}`)
      seen.set(id, group.relativePath)
    }
  }
}

function assertPositions(groups: BookGroup[]): void {
  for (const group of groups) {
    const positions = new Map<string, number>()
    let previousTier = -1

    for (const [index, book] of group.books.entries()) {
      const key = group.file === 'unranked.csv' ? 'all' : book.tier
      const expectedPosition = (positions.get(key) ?? 0) + 1
      if (Number(book.position) !== expectedPosition) {
        throw new Error(`${group.relativePath}: у «${book.title}» ожидалась позиция ${expectedPosition}`)
      }
      positions.set(key, expectedPosition)

      if (group.file !== 'unranked.csv') {
        const currentTier = tierOrder.get(book.tier) ?? 0
        if (currentTier < previousTier) throw new Error(`${group.relativePath}: тиры расположены не в порядке S–F`)
        previousTier = currentTier
      } else if (Number(book.position) !== index + 1) {
        throw new Error(`${group.relativePath}: нарушен общий порядок книг`)
      }
    }
  }
}

async function validate(): Promise<void> {
  const groups = await loadBooks()
  assertNoDuplicates(groups)
  assertPositions(groups)
  const history = parseHistory(JSON.parse(await readFile(path.join(root, 'data/history.json'), 'utf8')) as unknown)
  const knownBookIds = new Set(history.knownBookIds)
  for (const group of groups) {
    for (const book of group.books) {
      const id = book.url.match(/\/book\/(\d+)/)?.[1]
      if (!id || !knownBookIds.has(id)) throw new Error(`Книга ${id ?? book.title} отсутствует в базовой отметке истории`)
    }
  }
  if (new Set(history.events.map((event) => event.id)).size !== history.events.length) {
    throw new Error('В истории есть повторяющиеся события')
  }
  for (const group of groups) console.log(`✓ ${group.relativePath}: ${group.books.length}`)
  console.log(`✓ Всего книг: ${groups.reduce((total, group) => total + group.books.length, 0)}`)
  console.log(`✓ История: ${history.events.length} событий`)
}

async function sort(): Promise<void> {
  const groups = await loadBooks()
  assertNoDuplicates(groups)
  for (const group of groups) {
    const books = group.books
      .map((book, index) => ({ book, index }))
      .sort((left, right) => group.file === 'unranked.csv'
        ? Number(left.book.position) - Number(right.book.position) || left.index - right.index
        : (tierOrder.get(left.book.tier) ?? 0) - (tierOrder.get(right.book.tier) ?? 0)
          || Number(left.book.position) - Number(right.book.position)
          || left.index - right.index)
      .map(({ book }, index, sortedBooks) => {
        if (group.file === 'unranked.csv') return { ...book, position: String(index + 1) }
        const position = sortedBooks.slice(0, index).filter((item) => item.book.tier === book.tier).length + 1
        return { ...book, position: String(position) }
      })
    const csv = Papa.unparse({ fields: [...BOOK_COLUMNS], data: books }, { newline: '\n' })
    await writeFile(path.join(root, group.relativePath), `${csv}\n`, 'utf8')
    console.log(`✓ Отсортирован ${group.relativePath}`)
  }
  await validate()
}

const command = process.argv[2]

try {
  if (command === 'validate') await validate()
  else if (command === 'sort') await sort()
  else throw new Error('Использование: node --import tsx scripts/books.ts <validate|sort>')
} catch (error) {
  console.error(`Ошибка: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}
