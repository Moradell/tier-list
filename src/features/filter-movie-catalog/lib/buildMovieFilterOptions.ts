import type { Movie } from '@entities/movie'
import type { MovieFilterOptions } from '../model/types'

export function buildMovieFilterOptions(movies: Movie[]): MovieFilterOptions {
  return {
    countries: [...new Set(movies.flatMap((movie) => movie.countries))]
      .sort((first, second) => first.localeCompare(second, 'ru')),
    directors: [...new Set(movies.flatMap((movie) => movie.directors))]
      .sort((first, second) => first.localeCompare(second, 'ru')),
    genres: [...new Set(movies.map((movie) => movie.genre))]
      .sort((first, second) => first.localeCompare(second, 'ru')),
    years: [...new Set(movies.map((movie) => movie.year).filter(Boolean))]
      .sort((first, second) => Number(second) - Number(first)),
  }
}
