import { useState } from 'react'
import { authorPhotoPlaceholder, getAuthorPhoto, type Book } from '@entities/book'
import type { AuthorStatistic } from '../model/buildBookStatistics'
import { StatisticsBookCard } from './StatisticsBookCard'

interface AuthorLeaderboardProps {
  authors: AuthorStatistic[]
  books: Book[]
}

function formatRating(value: number): string {
  return value.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
}

export function AuthorLeaderboard({ authors, books }: AuthorLeaderboardProps) {
  const [expandedAuthor, setExpandedAuthor] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(3)
  const visibleAuthors = authors.slice(0, visibleCount)
  const hasMoreAuthors = visibleCount < authors.length

  function showMoreAuthors() {
    setVisibleCount((current) => Math.min(current === 3 ? 10 : current + 10, authors.length))
  }

  function collapseAuthors() {
    setVisibleCount(3)
    setExpandedAuthor(null)
  }

  return (
    <section className="author-leaderboard">
      <div className="author-leaderboard__title">
        <h2>Самые читаемые авторы</h2>
        <span className="author-leaderboard__metric-headings">
          <span>Книг</span>
          <span>Моя оценка</span>
          <span>LiveLib</span>
        </span>
        <span />
      </div>

      <div className="author-leaderboard__rows">
        {visibleAuthors.map((author) => {
          const isExpanded = expandedAuthor === author.author
          const authorBooks = books.filter((book) => book.author === author.author)
          const panelId = `author-books-${author.author}`.replace(/[^a-zа-яё0-9]+/gi, '-').toLowerCase()

          return (
            <div className={`author-leaderboard__row${isExpanded ? ' author-leaderboard__row--expanded' : ''}`} key={author.author}>
              <button
                className="author-leaderboard__trigger"
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => setExpandedAuthor(isExpanded ? null : author.author)}
              >
                <span className="author-leaderboard__identity">
                  <span className="author-leaderboard__photo-wrap">
                    <img
                      className="author-leaderboard__photo"
                      src={getAuthorPhoto(author.author)}
                      alt={`Портрет автора ${author.author}`}
                      onError={(event) => { event.currentTarget.src = authorPhotoPlaceholder }}
                    />
                  </span>
                  <strong>{author.author}</strong>
                </span>

                <span className="author-leaderboard__metrics">
                  <span><small>Книг</small><strong>{author.booksCount}</strong></span>
                  <span className="author-leaderboard__user-rating"><small>Моя</small><strong>{formatRating(author.averageUserRating)}</strong></span>
                  <span><small>LiveLib</small><strong>{formatRating(author.averageLivelibRating)}</strong></span>
                </span>

                <span className="author-leaderboard__chevron" aria-hidden="true">⌄</span>
              </button>

              {isExpanded && (
                <div className="author-leaderboard__books" id={panelId}>
                  {authorBooks.map((book) => (
                    <StatisticsBookCard book={book} key={book.id} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {(hasMoreAuthors || visibleCount > 3) && (
        <div className="author-leaderboard__actions">
          {hasMoreAuthors && (
            <button className="author-leaderboard__more" type="button" onClick={showMoreAuthors}>
              Показать ещё
            </button>
          )}
          {visibleCount > 3 && (
            <button className="author-leaderboard__more" type="button" onClick={collapseAuthors}>
              Свернуть
            </button>
          )}
        </div>
      )}
    </section>
  )
}
