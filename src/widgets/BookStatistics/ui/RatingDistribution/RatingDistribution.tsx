import { useState, type CSSProperties } from 'react'
import type { Book } from '@entities/book'
import type { StatisticItem } from '../../model/buildBookStatistics'
import { StatisticsBookCard } from '../StatisticsBookCard'
import './RatingDistribution.scss'

interface RatingDistributionProps {
  books: Book[]
  items: StatisticItem[]
}

type RatingStyle = CSSProperties & {
  '--rating-height'?: string
  '--tile-opacity'?: number
}

function getBookRating(book: Book): string {
  return String(Number(book.user_rating.replace(',', '.')))
}

function getBookCountLabel(count: number): string {
  const lastTwoDigits = count % 100
  const lastDigit = count % 10
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'книг'
  if (lastDigit === 1) return 'книга'
  if (lastDigit >= 2 && lastDigit <= 4) return 'книги'
  return 'книг'
}

export function RatingDistribution({ books, items }: RatingDistributionProps) {
  const [mode, setMode] = useState<'tiles' | 'histogram'>('tiles')
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const orderedItems = [...items].sort((a, b) => Number(a.label) - Number(b.label))
  const maximum = Math.max(...items.map((item) => item.value), 1)
  const selectedBooks = selectedRating
    ? books.filter((book) => getBookRating(book) === selectedRating)
    : []

  function selectRating(rating: string) {
    setSelectedRating((current) => current === rating ? null : rating)
  }

  return (
    <section className="rating-distribution">
      <div className="rating-distribution__heading">
        <h2>По личной оценке</h2>
        <div className="rating-distribution__modes" role="group" aria-label="Вид распределения оценок">
          <button
            className={mode === 'tiles' ? 'rating-distribution__mode--active' : ''}
            type="button"
            aria-pressed={mode === 'tiles'}
            onClick={() => setMode('tiles')}
          >
            Плитки
          </button>
          <button
            className={mode === 'histogram' ? 'rating-distribution__mode--active' : ''}
            type="button"
            aria-pressed={mode === 'histogram'}
            onClick={() => setMode('histogram')}
          >
            Распределение
          </button>
        </div>
      </div>

      {mode === 'tiles' ? (
        <article className="rating-variant">
          <div className="rating-tiles">
            {orderedItems.map((item) => {
              const isSelected = selectedRating === item.label
              const relativeValue = item.value / maximum
              const style: RatingStyle = { '--tile-opacity': 0.12 + relativeValue * 0.72 }

              return (
                <button
                  className={`rating-tile${relativeValue > 0.55 ? ' rating-tile--strong' : ''}${isSelected ? ' rating-tile--selected' : ''}`}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`Оценка ${item.label}: ${item.value} книг`}
                  key={item.label}
                  style={style}
                  onClick={() => selectRating(item.label)}
                >
                  <span className="rating-tile__count"><strong>{item.value}</strong><small>{getBookCountLabel(item.value)}</small></span>
                  <span className="rating-tile__score"><small>Оценка</small><strong>{item.label}</strong></span>
                </button>
              )
            })}
          </div>
        </article>
      ) : (
        <article className="rating-variant">
          <span className="rating-variant__axis-label">Количество книг</span>
          <div className="rating-histogram">
            {orderedItems.map((item) => {
              const isSelected = selectedRating === item.label
              const style: RatingStyle = { '--rating-height': `${(item.value / maximum) * 100}%` }

              return (
                <button
                  className={`rating-histogram__item${isSelected ? ' rating-histogram__item--selected' : ''}`}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`Оценка ${item.label}: ${item.value} книг`}
                  key={item.label}
                  onClick={() => selectRating(item.label)}
                >
                  <strong>{item.value}</strong>
                  <span className="rating-histogram__track" aria-hidden="true">
                    <span style={style} />
                  </span>
                  <small>{item.label}</small>
                </button>
              )
            })}
          </div>
          <span className="rating-variant__axis-label rating-variant__axis-label--bottom">Оценка</span>
        </article>
      )}

      {selectedRating && (
        <div className="rating-distribution__selection">
          <h3>Оценка {selectedRating} <span>{selectedBooks.length}</span></h3>
          <div className="rating-distribution__books">
            {selectedBooks.map((book) => (
              <StatisticsBookCard book={book} key={book.id} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
