import type { DragEvent } from 'react'
import { BookCard, type Book, type BookTier } from '@entities/book'
import type {
  BookDragEndHandler,
  BookDragOverHandler,
  BookDragStartHandler,
  BookDropHandler,
} from '@features/reorder-books'
import { TIERS } from './constants'
import './BookTierList.scss'

interface BookTierListProps {
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

export function BookTierList({
  books,
  dndEnabled,
  draggedBookId,
  fullMode,
  onDragEnd,
  onDragOverBook,
  onDragStart,
  onDrop,
  onDropBook,
}: BookTierListProps) {
  return (
    <div className="tier-list" aria-label="Полотно тир-листа">
      {TIERS.map((tier) => {
        const tierBooks = books.filter((book) => book.tier === tier.name)

        return (
          <section className="tier-row" key={tier.name} aria-label={`Уровень ${tier.name}`}>
            <div className="tier-label" style={{ backgroundColor: tier.color }}>
              <span>{tier.name}</span>
              <small>{tierBooks.length}</small>
            </div>
            <div
              className={`tier-content${fullMode ? ' tier-content-full' : ''}`}
              onDragOver={dndEnabled ? (event) => event.preventDefault() : undefined}
              onDrop={dndEnabled ? (event) => onDrop(event, tier.name) : undefined}
            >
              {tierBooks.map((book) => (
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
      })}
    </div>
  )
}
