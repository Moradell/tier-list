import novelsCsv from '@data/novels.csv?raw'
import storiesCsv from '@data/stories.csv?raw'
import mangaCsv from '@data/manga.csv?raw'
import unrankedCsv from '@data/unranked.csv?raw'
import { parseBooksCsv } from '@lib/books'
import type { Book, BookCategory } from '@/types/book'

function prepareBooks(csv: string, category: BookCategory, sourceName: string): Book[] {
  return parseBooksCsv(csv, sourceName).map((book) => ({
    ...book,
    category,
    id: book.url.match(/\/book\/(\d+)/)?.[1] ?? book.url,
  }))
}

export const initialBooks: Book[] = [
  ...prepareBooks(novelsCsv, 'Роман', 'data/novels.csv'),
  ...prepareBooks(storiesCsv, 'Рассказ', 'data/stories.csv'),
  ...prepareBooks(mangaCsv, 'Манга', 'data/manga.csv'),
  ...prepareBooks(unrankedCsv, 'Вне рейтинга', 'data/unranked.csv'),
]
