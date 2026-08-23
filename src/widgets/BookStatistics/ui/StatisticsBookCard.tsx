import { BookCard, type Book } from '@entities/book'

interface StatisticsBookCardProps {
  book: Book
}

export function StatisticsBookCard({ book }: StatisticsBookCardProps) {
  return <BookCard book={book} fullMode isDragging={false} />
}
