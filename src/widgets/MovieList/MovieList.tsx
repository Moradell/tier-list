import { MovieCard, type Movie } from '@entities/movie'
import './MovieList.scss'

interface MovieListProps {
  movies: Movie[]
  searchQuery: string
  title: string
}

export function MovieList({ movies, searchQuery, title }: MovieListProps) {
  return (
    <section className="movie-list" aria-label={title}>
      {movies.length > 0 ? (
        <div className="movie-list__grid">
          {movies.map((movie) => <MovieCard key={movie.kp_id} movie={movie} />)}
        </div>
      ) : (
        <div className="movie-list__empty">
          Ничего не найдено{searchQuery ? ` по запросу «${searchQuery}»` : ''}
        </div>
      )}
    </section>
  )
}
