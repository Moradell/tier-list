import { useLocation } from 'react-router-dom'
import type { Book } from '@entities/book'
import { useBookReorder } from '@features/reorder-books'
import { BackLink } from '@shared/ui/BackLink'
import {
  AuthorLeaderboard,
  buildBookStatistics,
  DecadeDistribution,
  ExpandableStatisticsPanel,
  RatingDistribution,
} from '@widgets/BookStatistics'
import './BooksStatsPage.scss'

function formatAverage(value: number): string {
  return value.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
}

function readYearGroup(book: Book): string | null {
  return book.read_date === '-' ? 'N/A' : book.read_date.slice(0, 4)
}

export function BooksStatsPage() {
  const { books } = useBookReorder()
  const { state } = useLocation()
  const returnTo = typeof state?.returnTo === 'string'
    && state.returnTo.startsWith('/books/')
    && state.returnTo !== '/books/stats'
    ? state.returnTo
    : '/books/novels'
  const statistics = buildBookStatistics(books)

  return (
    <main className="book-statistics">
      <header className="book-statistics__header">
        <BackLink label="К рейтингу" to={returnTo} />
        <div className="book-statistics__heading">
          <span className="book-statistics__eyebrow">Личная библиотека</span>
          <h1>Статистика чтения</h1>
        </div>
      </header>

      <section className="stats-summary" aria-label="Основные показатели">
        <article><span>Всего книг</span><strong>{statistics.total}</strong></article>
        <article><span>Моя средняя оценка</span><strong>{formatAverage(statistics.averageUserRating)}</strong></article>
        <article><span>Средняя на LiveLib</span><strong>{formatAverage(statistics.averageLivelibRating)}</strong></article>
      </section>

      <AuthorLeaderboard authors={statistics.topAuthors} books={books} />
      <RatingDistribution books={books} items={statistics.byRating} />

      <div className="stats-grid">
        <DecadeDistribution books={books} items={statistics.byDecade} />
        <ExpandableStatisticsPanel books={books} getGroup={readYearGroup} items={statistics.byReadYear} title="Прочитано по годам" />
      </div>
    </main>
  )
}
