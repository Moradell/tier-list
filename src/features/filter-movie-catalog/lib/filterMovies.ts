import type { Movie } from '@entities/movie'
import type { MovieFilters } from '../model/types'

export function filterMovies(movies: Movie[], filters: MovieFilters, searchQuery: string): Movie[] {
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ru-RU')

  return movies.filter((movie) => {
    if (normalizedQuery && !movie.title.toLocaleLowerCase('ru-RU').includes(normalizedQuery)) return false
    if (filters.actor && !movie.actors.includes(filters.actor)) return false
    if (filters.country && !movie.countries.includes(filters.country)) return false
    if (filters.director && !movie.directors.includes(filters.director)) return false
    if (filters.genre && movie.genre !== filters.genre) return false
    if (filters.year && movie.year !== filters.year) return false
    if (filters.rating === 'unrated' && movie.user_rating !== null) return false
    if (filters.rating && filters.rating !== 'unrated' && movie.user_rating !== Number(filters.rating)) return false
    return true
  })
}
