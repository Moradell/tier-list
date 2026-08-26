import type { Movie } from '@entities/movie'
import type { MovieFilterOptions } from '../model/types'

export function buildMovieFilterOptions(movies: Movie[]): MovieFilterOptions {
  const years = [...new Set(movies.map((movie) => movie.year).filter(Boolean))]
    .sort((first, second) => Number(second) - Number(first))
  const decades = [...new Set(years.flatMap((year) => {
    const numericYear = Number(year)
    return Number.isInteger(numericYear) && numericYear > 0
      ? [`${Math.floor(numericYear / 10) * 10}-е`]
      : []
  }))].sort((first, second) => Number.parseInt(second) - Number.parseInt(first))

  return {
    actors: [...new Set(movies.flatMap((movie) => movie.actors))]
      .sort((first, second) => first.localeCompare(second, 'ru')),
    countries: [...new Set(movies.flatMap((movie) => movie.countries))]
      .sort((first, second) => first.localeCompare(second, 'ru')),
    directors: [...new Set(movies.flatMap((movie) => movie.directors))]
      .sort((first, second) => first.localeCompare(second, 'ru')),
    genres: [...new Set(movies.map((movie) => movie.genre))]
      .sort((first, second) => first.localeCompare(second, 'ru')),
    years: [...decades, ...years],
  }
}
