import type { BookRecord } from './books'

export const BOOK_CATEGORIES = ['Роман', 'Рассказ', 'Манга', 'Вне рейтинга'] as const

export type BookCategory = (typeof BOOK_CATEGORIES)[number]

export interface Book extends BookRecord {
  category: BookCategory
  id: string
}
