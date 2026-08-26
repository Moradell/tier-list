import { useCallback, useEffect, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import type { Movie } from '../../model/movie'
import './MovieCardTooltip.scss'

interface MovieCardTooltipProps {
  anchorRef: RefObject<HTMLElement | null>
  id: string
  isOpen: boolean
  movie: Movie
}

interface TooltipPosition {
  left: number
  maxHeight: number
  top: number
  width: number
}

const TOOLTIP_GAP = 12
const TOOLTIP_MARGIN = 12
const TOOLTIP_WIDTH = 320
const POSTER_HOVER_OFFSET = 4

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} мин`
  return rest === 0 ? `${hours} ч` : `${hours} ч ${rest} мин`
}

export function MovieCardTooltip({ anchorRef, id, isOpen, movie }: MovieCardTooltipProps) {
  const [position, setPosition] = useState<TooltipPosition | null>(null)

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const rect = anchor.getBoundingClientRect()
    const width = Math.min(TOOLTIP_WIDTH, window.innerWidth - TOOLTIP_MARGIN * 2)
    const rightPosition = rect.right + TOOLTIP_GAP
    const leftPosition = rect.left - width - TOOLTIP_GAP
    const left = rightPosition + width <= window.innerWidth - TOOLTIP_MARGIN
      ? rightPosition
      : leftPosition >= TOOLTIP_MARGIN
        ? leftPosition
        : Math.max(TOOLTIP_MARGIN, window.innerWidth - width - TOOLTIP_MARGIN)
    const top = Math.max(TOOLTIP_MARGIN, rect.top - POSTER_HOVER_OFFSET)

    setPosition({
      left,
      maxHeight: window.innerHeight - top - TOOLTIP_MARGIN,
      top,
      width,
    })
  }, [anchorRef])

  useEffect(() => {
    if (!isOpen) return
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, updatePosition])

  if (!isOpen || !position) return null

  return createPortal(
    <aside className="movie-card-tooltip" id={id} role="tooltip" style={position}>
      <header>
        <strong>{movie.title}</strong>
        <span>{movie.user_rating ?? '—'}</span>
      </header>
      <dl>
        <div><dt>Год</dt><dd>{movie.year || 'Не указан'}</dd></div>
        <div><dt>Жанр</dt><dd>{movie.genre}</dd></div>
        <div><dt>Страна</dt><dd>{movie.countries.join(', ') || 'Не указана'}</dd></div>
        <div><dt>Длительность</dt><dd>{formatDuration(movie.duration_min)}</dd></div>
        <div><dt>Режиссёр</dt><dd>{movie.directors.join(', ') || 'Не указан'}</dd></div>
        <div><dt>Актёры</dt><dd>{movie.actors.slice(0, 5).join(', ') || 'Не указаны'}</dd></div>
      </dl>
    </aside>,
    document.body,
  )
}
