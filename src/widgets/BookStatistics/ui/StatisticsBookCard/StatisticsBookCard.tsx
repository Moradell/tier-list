import { BookCard, type Book } from '@entities/book'
import './StatisticsBookCard.scss'

interface StatisticsBookCardProps {
  book: Book
}

export function StatisticsBookCard({ book }: StatisticsBookCardProps) {
  return (
    <div className="statistics-book-card">
      <BookCard book={book} fullMode isDragging={false} />
    </div>
  )
}
