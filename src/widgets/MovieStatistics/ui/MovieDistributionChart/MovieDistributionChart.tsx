import { useMemo, useState, type CSSProperties } from 'react'
import { PieChart } from 'react-minimal-pie-chart'
import type { MovieDistributionItem } from '../../model/buildMovieDistribution'
import './MovieDistributionChart.scss'

type DistributionMode = 'average' | 'count'

interface MovieDistributionChartProps {
  items: MovieDistributionItem[]
  onItemSelect: (label: string) => void
  title: string
}

type MarkerStyle = CSSProperties & { '--marker-color': string }

const colors = [
  '#f0cf58', '#d9954e', '#c66b63', '#8eaa67', '#5fa99d',
  '#608cab', '#787bb5', '#9b70a5', '#b86f8d', '#aa8d63',
]

function formatValue(item: MovieDistributionItem, mode: DistributionMode): string {
  return mode === 'count'
    ? item.count.toLocaleString('ru-RU')
    : item.average.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
}

export function MovieDistributionChart({ items, onItemSelect, title }: MovieDistributionChartProps) {
  const [mode, setMode] = useState<DistributionMode>('count')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const topItems = useMemo(() => [...items]
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, 'ru'))
    .slice(0, 10), [items])
  const chartData = topItems.map((item, index) => ({
    color: colors[index],
    title: item.label,
    value: mode === 'count' ? item.count : item.average,
  }))
  const centerValue = mode === 'count'
    ? topItems.reduce((sum, item) => sum + item.count, 0).toLocaleString('ru-RU')
    : (topItems.reduce((sum, item) => sum + item.average, 0) / topItems.length)
      .toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
  const centerLabel = mode === 'average'
    ? 'средняя топ-10'
    : title === 'Режиссёры' ? 'работ в топ-10' : 'просмотров в топ-10'

  return (
    <section className="movie-distribution-chart">
      <div className="movie-distribution-chart__header">
        <div>
          <span>Топ-10</span>
          <h2>{title}</h2>
        </div>
        <div className="movie-distribution-chart__modes" role="group" aria-label={`Режим диаграммы «${title}»`}>
          <button
            className={mode === 'count' ? 'movie-distribution-chart__mode--active' : ''}
            type="button"
            aria-pressed={mode === 'count'}
            onClick={() => setMode('count')}
          >
            По просмотрам
          </button>
          <button
            className={mode === 'average' ? 'movie-distribution-chart__mode--active' : ''}
            type="button"
            aria-pressed={mode === 'average'}
            onClick={() => setMode('average')}
          >
            По оценке
          </button>
        </div>
      </div>

      <div className="movie-distribution-chart__content">
        <div
          className="movie-distribution-chart__donut"
          role="img"
          aria-label={`${title}: топ-10 ${mode === 'average' ? 'по средней оценке' : 'по количеству просмотров'}`}
        >
          <PieChart
            className="movie-distribution-chart__pie"
            data={chartData}
            background="#32322f"
            lineWidth={36}
            paddingAngle={0.8}
            radius={42}
            segmentsShift={(index) => activeIndex === index ? 2.2 : 0}
            segmentsStyle={(index) => ({
              cursor: 'pointer',
              filter: activeIndex === index ? 'brightness(1.35) saturate(1.2)' : undefined,
              opacity: activeIndex === null || activeIndex === index ? 1 : 0.48,
              transition: 'opacity 160ms ease, filter 160ms ease, transform 160ms ease',
            })}
            segmentsTabIndex={0}
            startAngle={-90}
            onFocus={(_, index) => setActiveIndex(index)}
            onBlur={() => setActiveIndex(null)}
            onClick={(_, index) => onItemSelect(topItems[index].label)}
            onMouseOver={(_, index) => setActiveIndex(index)}
            onMouseOut={() => setActiveIndex(null)}
          />
          <div className="movie-distribution-chart__center">
            <strong>{centerValue}</strong>
            <span>{centerLabel}</span>
          </div>
        </div>
        <ol className="movie-distribution-chart__legend">
          {topItems.map((item, index) => (
            <li key={item.label}>
              <button
                className={activeIndex === index ? 'movie-distribution-chart__legend-item--active' : ''}
                type="button"
                onClick={() => onItemSelect(item.label)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <i style={{ '--marker-color': colors[index] } as MarkerStyle} aria-hidden="true" />
                <span title={item.label}>{item.label}</span>
                <strong>{formatValue(item, mode)}</strong>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
