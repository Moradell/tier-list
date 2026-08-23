import type { Book } from '@entities/book'
import { BackLink } from '@shared/ui/BackLink'
import { AuthorLeaderboard } from './AuthorLeaderboard'
import { ExpandableStatisticsPanel } from './ExpandableStatisticsPanel'
import { buildBookStatistics } from '../model/buildBookStatistics'
import './BookStatistics.scss'

interface BookStatisticsProps {
  backTo: string
  books: Book[]
}

function formatAverage(value: number): string {
  return value.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
}

function ratingGroup(book: Book): string {
  return String(Number(book.user_rating.replace(',', '.')))
}

function readYearGroup(book: Book): string | null {
  return book.read_date === '-' ? null : book.read_date.slice(0, 4)
}

function publicationDecadeGroup(book: Book): string | null {
  const year = Number.parseInt(book.year, 10)
  return Number.isFinite(year) ? `${Math.floor(year / 10) * 10}-е` : null
}

export function BookStatistics({ backTo, books }: BookStatisticsProps) {
  const statistics = buildBookStatistics(books)

  return (
    <main className="book-statistics">
      <header className="book-statistics__header">
        <BackLink label="К рейтингу" to={backTo} />
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

      <div className="stats-grid">
        <ExpandableStatisticsPanel books={books} getGroup={ratingGroup} items={statistics.byRating} title="По личной оценке" />
        <ExpandableStatisticsPanel books={books} getGroup={readYearGroup} items={statistics.byReadYear} title="Прочитано по годам" />
        <ExpandableStatisticsPanel books={books} getGroup={publicationDecadeGroup} items={statistics.byDecade} title="Десятилетия публикации" />
      </div>
    </main>
  )
}
