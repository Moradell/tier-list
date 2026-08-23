import type { Movie } from '../../model/movie'
import './MovieCard.scss'

interface MovieCardProps {
  movie: Movie
}

const kindLabels: Record<Movie['kind'], string> = {
  film: 'Фильм',
  series: 'Сериал',
}

export function MovieCard({ movie }: MovieCardProps) {
  const kindLabel = movie.genre === 'аниме' ? 'Аниме' : kindLabels[movie.kind]

  return (
    <a
      className="movie-card"
      href={movie.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Открыть «${movie.title}» на Кинопоиске`}
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
        <span>{kindLabel}</span>
      </div>
    </a>
  )
}
