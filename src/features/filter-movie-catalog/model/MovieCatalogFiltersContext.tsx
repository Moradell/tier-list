import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { MovieFilterOptions, MovieFilters, MovieSortOrder } from './types'

const emptyFilters: MovieFilters = { actor: '', country: '', director: '', genre: '', rating: '', year: '' }
const emptyFilterOptions: MovieFilterOptions = { actors: [], countries: [], directors: [], genres: [], years: [] }

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
  initialFilters?: Partial<MovieFilters>
  resetKey: string
}

export function MovieCatalogFiltersProvider({ children, initialFilters = {}, resetKey }: MovieCatalogFiltersProviderProps) {
  const [filters, setFilters] = useState<MovieFilters>({ ...emptyFilters, ...initialFilters })
  const [filterOptions, setFilterOptions] = useState<MovieFilterOptions>(emptyFilterOptions)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<MovieSortOrder>('watch-date')

  useEffect(() => {
    setFilters({ ...emptyFilters, ...initialFilters })
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
