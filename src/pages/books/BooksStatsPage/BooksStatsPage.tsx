import { useLocation } from 'react-router-dom'
import { useBookReorder } from '@features/reorder-books'
import { BookStatistics } from '@widgets/BookStatistics'

export function BooksStatsPage() {
  const { books } = useBookReorder()
  const { state } = useLocation()
  const returnTo = typeof state?.returnTo === 'string'
    && state.returnTo.startsWith('/books/')
    && state.returnTo !== '/books/stats'
    ? state.returnTo
    : '/books/novels'

  return <BookStatistics backTo={returnTo} books={books} />
}
