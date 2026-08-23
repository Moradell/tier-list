import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { MovieFilterOptions, MovieFilters, MovieSortOrder } from './types'

const emptyFilters: MovieFilters = { country: '', director: '', genre: '', rating: '', year: '' }
const emptyFilterOptions: MovieFilterOptions = { countries: [], directors: [], genres: [], years: [] }

interface MovieCatalogFiltersContextValue {
  filterOptions: MovieFilterOptions
  filters: MovieFilters
  resetFilters: () => void
  searchQuery: string
  setFilter: (name: keyof MovieFilters, value: string) => void
  setFilterOptions: (options: MovieFilterOptions) => void
  setSearchQuery: (value: string) => void
  setSortOrder: (value: MovieSortOrder) => void
  sortOrder: MovieSortOrder
}

const MovieCatalogFiltersContext = createContext<MovieCatalogFiltersContextValue | null>(null)

interface MovieCatalogFiltersProviderProps {
  children: ReactNode
  resetKey: string
}

export function MovieCatalogFiltersProvider({ children, resetKey }: MovieCatalogFiltersProviderProps) {
  const [filters, setFilters] = useState<MovieFilters>(emptyFilters)
  const [filterOptions, setFilterOptions] = useState<MovieFilterOptions>(emptyFilterOptions)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<MovieSortOrder>('watch-date')

  useEffect(() => {
    setFilters(emptyFilters)
    setFilterOptions(emptyFilterOptions)
  }, [resetKey])

  const value = useMemo<MovieCatalogFiltersContextValue>(() => ({
    filterOptions,
    filters,
    resetFilters: () => setFilters(emptyFilters),
    searchQuery,
    setFilter: (name, nextValue) => setFilters((current) => ({ ...current, [name]: nextValue })),
    setFilterOptions,
    setSearchQuery,
    setSortOrder,
    sortOrder,
  }), [filterOptions, filters, searchQuery, sortOrder])

  return (
    <MovieCatalogFiltersContext.Provider value={value}>
      {children}
    </MovieCatalogFiltersContext.Provider>
  )
}

export function useMovieCatalogFilters(): MovieCatalogFiltersContextValue {
  const context = useContext(MovieCatalogFiltersContext)
  if (!context) throw new Error('useMovieCatalogFilters должен использоваться внутри MovieCatalogFiltersProvider')
  return context
}
