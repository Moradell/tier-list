import { useEffect } from 'react'
import { useMovieHistory } from '../../model/MovieHistoryProvider'
import './MovieHistoryDrawer.scss'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function MovieHistoryDrawer() {
  const { closeHistory, events, isOpen } = useMovieHistory()

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
    <div className="movie-history-layer">
      <button
        className="movie-history-overlay"
        type="button"
        aria-label="Закрыть историю"
        onClick={closeHistory}
      />
      <aside className="movie-history-drawer" role="dialog" aria-modal="true" aria-labelledby="movie-history-title">
        <header className="movie-history-header">
          <div>
            <h2 id="movie-history-title">История</h2>
            <span>{events.length} новых записей</span>
          </div>
          <button className="movie-history-close" type="button" aria-label="Закрыть историю" onClick={closeHistory}>×</button>
        </header>

        {events.length === 0 ? (
          <div className="movie-history-empty">
            <strong>История пока пуста</strong>
            <p>Здесь появятся фильмы, сериалы и аниме, добавленные после создания истории.</p>
          </div>
        ) : (
          <div className="movie-history-list">
            {[...events].reverse().map((event) => (
              <a className="movie-history-item" href={event.movie.url} target="_blank" rel="noreferrer" key={event.id}>
                <img src={event.movie.poster} alt="" loading="lazy" />
                <div className="movie-history-details">
                  <strong>{event.movie.title}</strong>
                  <span>Оценка: {event.movie.rating ?? '—'}</span>
                </div>
                <time dateTime={event.createdAt}>{formatDate(event.createdAt)}</time>
              </a>
            ))}
          </div>
        )}
      </aside>
    </div>
  )
}
