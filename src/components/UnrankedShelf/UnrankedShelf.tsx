import { BookCard } from '@components/BookCard'
import type {
  Book,
  BookDragEndHandler,
  BookDragOverHandler,
  BookDragStartHandler,
  BookDropHandler,
} from '@/types/book'
import './UnrankedShelf.scss'

interface UnrankedShelfProps {
  books: Book[]
  dndEnabled: boolean
  draggedBookId: string | null
  fullMode: boolean
  onDragEnd: BookDragEndHandler
  onDragOverBook: BookDragOverHandler
  onDragStart: BookDragStartHandler
  onDropBook: BookDropHandler
}

export function UnrankedShelf({
  books,
  dndEnabled,
  draggedBookId,
  fullMode,
  onDragEnd,
  onDragOverBook,
  onDragStart,
  onDropBook,
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
            dndEnabled={dndEnabled}
            fullMode={fullMode}
            isDragging={book.id === draggedBookId}
            key={book.id}
            onDragEnd={onDragEnd}
            onDragOverBook={onDragOverBook}
            onDragStart={onDragStart}
            onDropBook={onDropBook}
          />
        ))}
      </div>
    </section>
  )
}
