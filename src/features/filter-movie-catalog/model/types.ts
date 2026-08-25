export type MovieSortOrder = 'watch-date' | 'rating-desc' | 'rating-asc'

export interface MovieFilters {
  actor: string
  country: string
  director: string
  genre: string
  rating: string
  year: string
}

export interface MovieFilterOptions {
  actors: string[]
  countries: string[]
  directors: string[]
  genres: string[]
  years: string[]
}
