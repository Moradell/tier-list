import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Papa from 'papaparse'
import { BOOK_COLUMNS, BOOK_TIERS, parseBooksCsv, type BookRecord } from '@lib/books'

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

async function validate(): Promise<void> {
  const groups = await loadBooks()
  assertNoDuplicates(groups)
  for (const group of groups) console.log(`✓ ${group.relativePath}: ${group.books.length}`)
  console.log(`✓ Всего книг: ${groups.reduce((total, group) => total + group.books.length, 0)}`)
}

async function sort(): Promise<void> {
  const groups = await loadBooks()
  assertNoDuplicates(groups)
  for (const group of groups) {
    const books = group.books
      .map((book, index) => ({ book, index }))
      .sort((left, right) => (tierOrder.get(left.book.tier) ?? 0) - (tierOrder.get(right.book.tier) ?? 0) || left.index - right.index)
      .map(({ book }) => book)
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
