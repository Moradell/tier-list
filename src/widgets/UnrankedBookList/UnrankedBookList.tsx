import { BookCard, type Book } from '@entities/book'
import type {
  BookDragEndHandler,
  BookDragOverHandler,
  BookDragStartHandler,
  BookDropHandler,
} from '@features/reorder-books'
import './UnrankedBookList.scss'

interface UnrankedBookListProps {
  books: Book[]
  dndEnabled: boolean
  draggedBookId: string | null
  fullMode: boolean
  onDragEnd: BookDragEndHandler
  onDragOverBook: BookDragOverHandler
  onDragStart: BookDragStartHandler
  onDropBook: BookDropHandler
}

export function UnrankedBookList({
  books,
  dndEnabled,
  draggedBookId,
  fullMode,
  onDragEnd,
  onDragOverBook,
  onDragStart,
  onDropBook,
}: UnrankedBookListProps) {
  return (
    <section className="unranked-shelf" aria-label="Книги вне рейтинга">
      <header className="unranked-header">
        <h1>Вне рейтинга</h1>
        <span>{books.length} книг</span>
      </header>
      <div className={`unranked-grid${fullMode ? ' unranked-grid-full' : ''}`}>
        {books.map((book) => (
          <BookCard
            book={book}
            draggable={dndEnabled}
            fullMode={fullMode}
            isDragging={book.id === draggedBookId}
            key={book.id}
            onDragEnd={dndEnabled ? onDragEnd : undefined}
            onDragOver={dndEnabled ? (event) => onDragOverBook(event, book.id) : undefined}
            onDragStart={dndEnabled ? (event) => onDragStart(event, book.id) : undefined}
            onDrop={dndEnabled ? (event) => {
              event.preventDefault()
              event.stopPropagation()
              onDropBook()
            } : undefined}
          />
        ))}
      </div>
    </section>
  )
}
