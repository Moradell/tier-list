import { useId, useRef, useState } from 'react'
import type { Movie } from '../../model/movie'
import { MovieCardTooltip } from '../MovieCardTooltip'
import './MovieCard.scss'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const tooltipId = useId()
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  return (
    <a
      ref={cardRef}
      className="movie-card"
      href={movie.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Открыть «${movie.title}» на Кинопоиске`}
      aria-describedby={isTooltipOpen ? tooltipId : undefined}
      onMouseEnter={() => setIsTooltipOpen(true)}
      onMouseLeave={() => setIsTooltipOpen(false)}
      onFocus={() => setIsTooltipOpen(true)}
      onBlur={() => setIsTooltipOpen(false)}
    >
      <div className="movie-card__poster-wrap">
        <img
          className="movie-card__poster"
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          decoding="async"
        />
        <span className="movie-card__rating" aria-label={`Моя оценка: ${movie.user_rating ?? 'нет'}`}>
          {movie.user_rating ?? '—'}
        </span>
      </div>
      <div className="movie-card__details">
        <h2>{movie.title}</h2>
        <p>{movie.year || 'Год не указан'} · {movie.genre}</p>
      </div>
      <MovieCardTooltip anchorRef={cardRef} id={tooltipId} isOpen={isTooltipOpen} movie={movie} />
    </a>
  )
}
