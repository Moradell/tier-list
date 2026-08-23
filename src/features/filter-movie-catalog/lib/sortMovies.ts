import type { Movie } from '@entities/movie'
import type { MovieSortOrder } from '../model/types'

export function sortMovies(movies: Movie[], sortOrder: MovieSortOrder): Movie[] {
  if (sortOrder === 'watch-date') return movies

  return [...movies].sort((first, second) => {
    if (first.user_rating === null) return second.user_rating === null ? 0 : 1
    if (second.user_rating === null) return -1

    return sortOrder === 'rating-desc'
      ? second.user_rating - first.user_rating
      : first.user_rating - second.user_rating
  })
}
