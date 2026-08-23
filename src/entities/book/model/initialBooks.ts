import novelsJson from '@data/novels.json'
import storiesJson from '@data/stories.json'
import mangaJson from '@data/manga.json'
import unrankedJson from '@data/unranked.json'
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
  ...prepareBooks(novelsJson, 'Роман', 'data/novels.json'),
  ...prepareBooks(storiesJson, 'Рассказ', 'data/stories.json'),
  ...prepareBooks(mangaJson, 'Манга', 'data/manga.json'),
  ...prepareBooks(unrankedJson, 'Вне рейтинга', 'data/unranked.json'),
]
