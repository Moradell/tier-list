import novelsJson from '@data/books/novels.json'
import storiesJson from '@data/books/stories.json'
import mangaJson from '@data/books/manga.json'
import unrankedJson from '@data/books/unranked.json'
import { parseBooksJson } from './books'
import type { Book, BookCategory } from './types'

function prepareBooks(value: unknown, category: BookCategory, sourceName: string): Book[] {
  return parseBooksJson(value, sourceName).map((book) => ({
    ...book,
    category,
    id: book.url.match(/\/book\/(\d+)/)?.[1] ?? book.url,
  }))
}

export const initialBooks: Book[] = [
  ...prepareBooks(novelsJson, 'Роман', 'data/books/novels.json'),
  ...prepareBooks(storiesJson, 'Рассказ', 'data/books/stories.json'),
  ...prepareBooks(mangaJson, 'Манга', 'data/books/manga.json'),
  ...prepareBooks(unrankedJson, 'Вне рейтинга', 'data/books/unranked.json'),
]
