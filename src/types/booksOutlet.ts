import type { DragEvent } from 'react'
import type { BookTier } from '@lib/books'
import type {
  Book,
  BookDragEndHandler,
  BookDragOverHandler,
  BookDragStartHandler,
  BookDropHandler,
} from './book'

export interface BooksOutletContext {
  books: Book[]
  dndEnabled: boolean
  draggedBookId: string | null
  fullMode: boolean
  onDragEnd: BookDragEndHandler
  onDragOverBook: BookDragOverHandler
  onDragStart: BookDragStartHandler
  onDrop: (event: DragEvent<HTMLDivElement>, tier: BookTier) => void
  onDropBook: BookDropHandler
}
