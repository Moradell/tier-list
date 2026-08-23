import { useState } from 'react'
import type { Book } from '@entities/book'
import type { StatisticItem } from '../model/buildBookStatistics'
import { StatisticsBookCard } from './StatisticsBookCard'

interface ExpandableStatisticsPanelProps {
  books: Book[]
  getGroup: (book: Book) => string | null
  items: StatisticItem[]
  title: string
}

export function ExpandableStatisticsPanel({ books, getGroup, items, title }: ExpandableStatisticsPanelProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const maximum = Math.max(...items.map((item) => item.value), 1)

  return (
    <section className="stats-panel stats-breakdown">
      <h2>{title}</h2>
      <div className="stats-breakdown__list">
        {items.map((item) => {
          const isExpanded = expandedGroup === item.label
          const groupBooks = books.filter((book) => getGroup(book) === item.label)
          const panelId = `stat-books-${title}-${item.label}`.replace(/[^a-zа-яё0-9]+/gi, '-').toLowerCase()

          return (
            <div className={`stats-breakdown__group${isExpanded ? ' stats-breakdown__group--expanded' : ''}`} key={item.label}>
              <button
                className="stats-breakdown__trigger"
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => setExpandedGroup(isExpanded ? null : item.label)}
              >
                <span className="stats-breakdown__label" title={item.label}>{item.label}</span>
                <span className="stats-breakdown__track" aria-hidden="true">
                  <span style={{ width: `${(item.value / maximum) * 100}%` }} />
                </span>
                <strong>{item.value}</strong>
                <span className="stats-breakdown__chevron" aria-hidden="true">⌄</span>
              </button>

              {isExpanded && (
                <div className="stats-breakdown__books" id={panelId}>
                  {groupBooks.map((book) => (
                    <StatisticsBookCard book={book} key={book.id} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
