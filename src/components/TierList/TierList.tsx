import type { DragEvent } from 'react'
import type { BookTier } from '@lib/books'
import type {
  Book,
  BookDragEndHandler,
  BookDragOverHandler,
  BookDragStartHandler,
} from '@/types/book'
import { BookCard } from '@components/BookCard'
import { TIERS } from './constants'
import './TierList.scss'

interface TierListProps {
  books: Book[]
  draggedBookId: string | null
  fullMode: boolean
  onDragEnd: BookDragEndHandler
  onDragOverBook: BookDragOverHandler
  onDragStart: BookDragStartHandler
  onDrop: (event: DragEvent<HTMLDivElement>, tier: BookTier) => void
}

export function TierList({
  books,
  draggedBookId,
  fullMode,
  onDragEnd,
  onDragOverBook,
  onDragStart,
  onDrop,
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
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => onDrop(event, tier.name)}
            >
              {tierBooks.map((book) => (
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
      })}
    </div>
  )
}
