import type { DragEvent } from 'react'
import type { BookTier } from '@lib/books'
import type {
  Book,
  BookDragEndHandler,
  BookDragOverHandler,
  BookDragStartHandler,
  BookDropHandler,
} from '@/types/book'
import { BookCard } from '@components/BookCard'
import { TIERS } from './constants'
import './TierList.scss'

interface TierListProps {
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

export function TierList({
  books,
  dndEnabled,
  draggedBookId,
  fullMode,
  onDragEnd,
  onDragOverBook,
  onDragStart,
  onDrop,
  onDropBook,
}: TierListProps) {
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
      })}
    </div>
  )
}
