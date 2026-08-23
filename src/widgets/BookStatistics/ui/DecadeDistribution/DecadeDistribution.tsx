import { useState, type CSSProperties } from 'react'
import type { Book } from '@entities/book'
import type { StatisticItem } from '../../model/buildBookStatistics'
import { StatisticsBookCard } from '../StatisticsBookCard'
import './DecadeDistribution.scss'

interface DecadeDistributionProps {
  books: Book[]
  items: StatisticItem[]
}

type DecadeStyle = CSSProperties & {
  '--decade-intensity'?: number
}

function getBookDecade(book: Book): string | null {
  const year = Number.parseInt(book.year, 10)
  return Number.isFinite(year) ? `${Math.floor(year / 10) * 10}-е` : null
}

function getCenturyLabel(year: number): string {
  const century = Math.floor(year / 100) + 1
  const roman = [
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI',
  ]
  return roman[century] ?? String(century)
}

export function DecadeDistribution({ books, items }: DecadeDistributionProps) {
  const [selectedDecade, setSelectedDecade] = useState<string | null>(null)
  const decades = items.map((item) => ({ ...item, decade: Number.parseInt(item.label, 10) }))
  const maximum = Math.max(...decades.map((item) => item.value), 1)
  const valuesByDecade = new Map(decades.map((item) => [item.decade, item]))
  const centuries = [...new Set(decades.map((item) => Math.floor(item.decade / 100) + 1))].sort((a, b) => a - b)
  const selectedBooks = selectedDecade
    ? books.filter((book) => getBookDecade(book) === selectedDecade)
    : []

  function selectDecade(decade: string) {
    setSelectedDecade((current) => current === decade ? null : decade)
  }

  return (
    <section className="decade-distribution">
      <div className="decade-distribution__heading">
        <h2>Десятилетия публикации</h2>
      </div>

      <div className="decade-heatmap">
        <div className="decade-heatmap__corner">Век</div>
        {Array.from({ length: 10 }, (_, index) => <div className="decade-heatmap__column" key={index}>{index}0-е</div>)}
        {centuries.map((century) => (
          <div className="decade-heatmap__row" key={century}>
            <strong>{getCenturyLabel((century - 1) * 100)}</strong>
            {Array.from({ length: 10 }, (_, index) => {
              const decade = (century - 1) * 100 + index * 10
              const item = valuesByDecade.get(decade)
              const label = `${decade}-е`
              const isSelected = selectedDecade === label
              const style: DecadeStyle = item ? { '--decade-intensity': 0.18 + (item.value / maximum) * 0.82 } : {}

              return item ? (
                <button
                  className={`decade-heatmap__cell${isSelected ? ' decade-heatmap__cell--selected' : ''}`}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${label}: ${item.value} книг`}
                  key={decade}
                  style={style}
                  title={`${label}: ${item.value} книг`}
                  onClick={() => selectDecade(label)}
                >
                  {item.value}
                </button>
              ) : <span className="decade-heatmap__cell decade-heatmap__cell--empty" key={decade}>—</span>
            })}
          </div>
        ))}
      </div>

      {selectedDecade && (
        <div className="decade-distribution__selection">
          <h3>{selectedDecade}</h3>
          <div className="decade-distribution__books">
            {selectedBooks.map((book) => <StatisticsBookCard book={book} key={book.id} />)}
          </div>
        </div>
      )}
    </section>
  )
}
