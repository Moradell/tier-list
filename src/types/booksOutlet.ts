import type { DragEvent } from 'react'
import type { BookTier } from '@lib/books'
import type {
  Book,
  BookDragEndHandler,
  BookDragOverHandler,
  BookDragStartHandler,
} from './book'

export interface BooksOutletContext {
  books: Book[]
  draggedBookId: string | null
  fullMode: boolean
  onDragEnd: BookDragEndHandler
  onDragOverBook: BookDragOverHandler
  onDragStart: BookDragStartHandler
  onDrop: (event: DragEvent<HTMLDivElement>, tier: BookTier) => void
}
