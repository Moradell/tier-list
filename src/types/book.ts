import type { DragEvent } from 'react'
import type { BookRecord } from '@lib/books'

export const BOOK_CATEGORIES = ['Роман', 'Рассказ', 'Манга', 'Вне рейтинга'] as const

export type BookCategory = (typeof BOOK_CATEGORIES)[number]

export interface Book extends BookRecord {
  category: BookCategory
  id: string
}

export type BookDragStartHandler = (event: DragEvent<HTMLElement>, bookId: string) => void
export type BookDragOverHandler = (event: DragEvent<HTMLDivElement>, bookId: string) => void
export type BookDragEndHandler = () => void
