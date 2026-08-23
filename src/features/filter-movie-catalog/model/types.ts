export type MovieSortOrder = 'watch-date' | 'rating-desc' | 'rating-asc'

export interface MovieFilters {
  country: string
  director: string
  genre: string
  rating: string
  year: string
}

export interface MovieFilterOptions {
  countries: string[]
  directors: string[]
  genres: string[]
  years: string[]
}
