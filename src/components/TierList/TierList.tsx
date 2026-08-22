import type { DragEvent } from 'react'
import type { BookTier } from '@lib/books'
import type { Book, BookDragStartHandler } from '@/types/book'
import { BookCard } from '@components/BookCard'
import { TIERS } from './constants'
import './TierList.scss'

interface TierListProps {
  books: Book[]
  fullMode: boolean
  onDragStart: BookDragStartHandler
  onDrop: (event: DragEvent<HTMLDivElement>, tier: BookTier) => void
}

export function TierList({ books, fullMode, onDragStart, onDrop }: TierListProps) {
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
                <BookCard book={book} fullMode={fullMode} key={book.id} onDragStart={onDragStart} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
