import { BookCard } from '@components/BookCard'
import type {
  Book,
  BookDragEndHandler,
  BookDragOverHandler,
  BookDragStartHandler,
} from '@/types/book'
import './UnrankedShelf.scss'

interface UnrankedShelfProps {
  books: Book[]
  draggedBookId: string | null
  fullMode: boolean
  onDragEnd: BookDragEndHandler
  onDragOverBook: BookDragOverHandler
  onDragStart: BookDragStartHandler
}

export function UnrankedShelf({
  books,
  draggedBookId,
  fullMode,
  onDragEnd,
  onDragOverBook,
  onDragStart,
}: UnrankedShelfProps) {
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
            fullMode={fullMode}
            isDragging={book.id === draggedBookId}
            key={book.id}
            onDragEnd={onDragEnd}
            onDragOverBook={onDragOverBook}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </section>
  )
}
