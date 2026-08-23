import { useEffect } from 'react'
import type { BookHistoryEvent } from '@entities/book-history'
import { useBookHistory } from '../../model/BookHistoryProvider'
import './BookHistoryDrawer.scss'

function formatPosition(event: BookHistoryEvent, position: BookHistoryEvent['to']): string {
  return event.book.category === 'Вне рейтинга'
    ? `№${position.position}`
    : `${position.tier}${position.position}`
}

function formatDate(value: string): string {
  const date = new Date(value)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const dayDifference = Math.round((startOfToday - startOfDate) / 86_400_000)
  const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date)

  if (dayDifference === 0) return `Сегодня, ${time}`
  if (dayDifference === 1) return `Вчера, ${time}`
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

function formatExactDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

export function BookHistoryDrawer() {
  const { closeHistory, events, isOpen } = useBookHistory()
  const newestEvents = [...events].reverse()

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeHistory()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeHistory, isOpen])

  if (!isOpen) return null

  return (
    <div className="history-layer">
      <button className="history-overlay" type="button" aria-label="Закрыть историю" onClick={closeHistory} />
      <aside className="history-drawer" role="dialog" aria-modal="true" aria-labelledby="history-title">
        <header className="history-header">
          <div>
            <h2 id="history-title">История</h2>
            <span>{events.length} изменений</span>
          </div>
          <button className="history-close" type="button" aria-label="Закрыть историю" onClick={closeHistory}>×</button>
        </header>

        {newestEvents.length === 0 ? (
          <div className="history-empty">
            <strong>История пока пуста</strong>
            <p>Здесь появятся новые книги и изменения их позиций.</p>
          </div>
        ) : (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Книга</th>
                  <th>Изменение</th>
                  <th>Когда</th>
                </tr>
              </thead>
              <tbody>
                {newestEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <a className="history-book" href={event.book.url} target="_blank" rel="noreferrer">
                        <img src={`${import.meta.env.BASE_URL}${event.book.cover.replace(/^\/+/, '')}`} alt="" />
                        <span>
                          <strong>{event.book.title}</strong>
                          <small>{event.book.author}</small>
                        </span>
                      </a>
                    </td>
                    <td>
                      {event.type === 'new' ? (
                        <span className="history-change history-change-new">
                          <small>НОВОЕ</small>
                          {formatPosition(event, event.to)}
                        </span>
                      ) : (
                        <span className="history-change">
                          {formatPosition(event, event.from!)}
                          <i aria-hidden="true">→</i>
                          <strong>{formatPosition(event, event.to)}</strong>
                        </span>
                      )}
                    </td>
                    <td>
                      <time className="history-date" dateTime={event.createdAt} title={formatExactDate(event.createdAt)}>
                        {formatDate(event.createdAt)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </aside>
    </div>
  )
}
