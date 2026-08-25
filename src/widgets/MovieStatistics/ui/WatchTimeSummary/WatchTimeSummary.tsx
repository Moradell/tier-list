import { Award, Earth, Languages, Moon } from 'lucide-react'
import './WatchTimeSummary.scss'

interface WatchTimeSummaryProps {
  animeMinutes: number
  filmMinutes: number
  seriesMinutes: number
}

interface TimeItem {
  label: string
  minutes: number
}

function formatDaysAndHours(minutes: number): string {
  const hours = Math.round(minutes / 60)
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return `${days.toLocaleString('ru-RU')} дн. ${remainingHours} ч`
}

function formatHours(minutes: number): string {
  return `${Math.round(minutes / 60).toLocaleString('ru-RU')} часов`
}

export function WatchTimeSummary({ animeMinutes, filmMinutes, seriesMinutes }: WatchTimeSummaryProps) {
  const totalMinutes = animeMinutes + filmMinutes + seriesMinutes
  const totalHours = totalMinutes / 60
  const timeItems: TimeItem[] = [
    { label: 'Всего', minutes: totalMinutes },
    { label: 'Фильмы', minutes: filmMinutes },
    { label: 'Сериалы', minutes: seriesMinutes },
    { label: 'Аниме', minutes: animeMinutes },
  ]
  const alternatives = [
    {
      label: 'Обойти Землю пешком',
      value: `${(totalHours * 5 / 40_075).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} раза`,
      note: 'при 5 км/ч, экватор — 40 075 км',
      Icon: Earth,
    },
    {
      label: 'Стать экспертом',
      value: `${(totalHours / 10_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} раза`,
      note: 'по условному правилу 10 000 часов',
      Icon: Award,
    },
    {
      label: 'Освоить язык до B2',
      value: `${Math.round(totalHours / 600).toLocaleString('ru-RU')} языка`,
      note: 'примерно по 600 часов на язык',
      Icon: Languages,
    },
    {
      label: 'Полноценно выспаться',
      value: Math.round(totalHours / 8).toLocaleString('ru-RU'),
      note: 'ночей по 8 часов',
      Icon: Moon,
    },
  ]

  return (
    <section className="watch-time-summary" aria-labelledby="watch-time-title">
      <div className="watch-time-summary__heading">
        <div>
          <h2 id="watch-time-title">Сколько занял просмотр</h2>
          <p>Фильмы, сериалы и аниме — в часах и полных сутках</p>
        </div>
      </div>

      <div className="watch-time-summary__totals">
        {timeItems.map((item, index) => (
          <article key={item.label} className={index === 0 ? 'watch-time-summary__total' : undefined}>
            <span>{item.label}</span>
            <strong>{formatHours(item.minutes)}</strong>
            <small>{formatDaysAndHours(item.minutes)}</small>
          </article>
        ))}
      </div>

      <div className="watch-time-summary__alternatives-heading">
        <div>
          <h3>Что можно было успеть</h3>
          <p>Альтернативные способы потратить то же время</p>
        </div>
      </div>
      <div className="watch-time-summary__alternatives">
        {alternatives.map(({ Icon, ...item }) => (
          <article key={item.label}>
            <span className="watch-time-summary__alternative-icon" aria-hidden="true">
              <Icon />
            </span>
            <div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <small>{item.note}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
