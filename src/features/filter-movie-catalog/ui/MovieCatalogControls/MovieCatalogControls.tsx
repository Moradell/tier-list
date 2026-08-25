import { useEffect, useRef, useState, type ReactNode } from 'react'
import { DropdownSelect, type DropdownSelectOption } from '@shared/ui/DropdownSelect'
import { useMovieCatalogFilters } from '../../model/MovieCatalogFiltersContext'
import type { MovieSortOrder } from '../../model/types'
import './MovieCatalogControls.scss'

const sortOptions: DropdownSelectOption[] = [
  { label: 'По дате просмотра', value: 'watch-date' },
  { label: 'По оценке: 10 → 1', value: 'rating-desc' },
  { label: 'По оценке: 1 → 10', value: 'rating-asc' },
]
const ratingOptions: DropdownSelectOption[] = [
  { label: 'Любая оценка', value: '' },
  ...Array.from({ length: 10 }, (_, index) => ({ label: String(10 - index), value: String(10 - index) })),
  { label: 'Без оценки', value: 'unrated' },
]

interface MovieCatalogControlsProps {
  navigation: ReactNode
}

export function MovieCatalogControls({ navigation }: MovieCatalogControlsProps) {
  const {
    filterOptions,
    filters,
    resetFilters,
    searchQuery,
    setFilter,
    setSearchQuery,
    setSortOrder,
    sortOrder,
  } = useMovieCatalogFilters()
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus()
  }, [isSearchOpen])

  useEffect(() => {
    if (Object.values(filters).some(Boolean)) setIsFiltersOpen(true)
  }, [filters])

  return (
    <>
      <div className="movie-tabs-toolbar">
        {navigation}
        <div className="movie-toolbar-actions">
          <DropdownSelect
            ariaLabel="Сортировка"
            className="movie-sort-select"
            value={sortOrder}
            options={sortOptions}
            onValueChange={(value) => setSortOrder(value as MovieSortOrder)}
          />
          <button
            className={`movie-filter-trigger${isFiltersOpen ? ' movie-filter-trigger--active' : ''}`}
            type="button"
            aria-label={isFiltersOpen ? 'Выключить фильтры' : 'Включить фильтры'}
            aria-expanded={isFiltersOpen}
            onClick={() => {
              if (isFiltersOpen) resetFilters()
              setIsFiltersOpen(!isFiltersOpen)
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          </button>
          {isSearchOpen ? (
            <label className="movie-search">
              <input
                ref={searchInputRef}
                type="search"
                aria-label="Поиск по названию"
                value={searchQuery}
                placeholder="По названию"
                onBlur={() => {
                  if (!searchQuery.trim()) setIsSearchOpen(false)
                }}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
          ) : (
            <button
              className="movie-search-trigger"
              type="button"
              aria-label="Открыть поиск"
              onClick={() => setIsSearchOpen(true)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {isFiltersOpen && (
        <div className="movie-filters" aria-label="Фильтры каталога">
          <div className="movie-filter-field">
            <span className="movie-filter-label">Актёр</span>
            <DropdownSelect
              ariaLabel="Фильтр по актёру"
              className="movie-filter-select"
              searchable
              scrollable
              value={filters.actor}
              options={[
                { label: 'Все актёры', value: '' },
                ...filterOptions.actors.map((actor) => ({ label: actor, value: actor })),
              ]}
              onValueChange={(value) => setFilter('actor', value)}
            />
          </div>
          <div className="movie-filter-field">
            <span className="movie-filter-label">Режиссёр</span>
            <DropdownSelect
              ariaLabel="Фильтр по режиссёру"
              className="movie-filter-select"
              searchable
              scrollable
              value={filters.director}
              options={[
                { label: 'Все режиссёры', value: '' },
                ...filterOptions.directors.map((director) => ({ label: director, value: director })),
              ]}
              onValueChange={(value) => setFilter('director', value)}
            />
          </div>
          <div className="movie-filter-field">
            <span className="movie-filter-label">Жанр</span>
            <DropdownSelect
              ariaLabel="Фильтр по жанру"
              className="movie-filter-select"
              searchable
              scrollable
              value={filters.genre}
              options={[
                { label: 'Все жанры', value: '' },
                ...filterOptions.genres.map((genre) => ({ label: genre, value: genre })),
              ]}
              onValueChange={(value) => setFilter('genre', value)}
            />
          </div>
          <div className="movie-filter-field">
            <span className="movie-filter-label">Страна</span>
            <DropdownSelect
              ariaLabel="Фильтр по стране"
              className="movie-filter-select"
              searchable
              scrollable
              value={filters.country}
              options={[
                { label: 'Все страны', value: '' },
                ...filterOptions.countries.map((country) => ({ label: country, value: country })),
              ]}
              onValueChange={(value) => setFilter('country', value)}
            />
          </div>
          <div className="movie-filter-field">
            <span className="movie-filter-label">Год</span>
            <DropdownSelect
              ariaLabel="Фильтр по году"
              className="movie-filter-select"
              searchMatch="starts-with"
              searchable
              scrollable
              value={filters.year}
              options={[
                { label: 'Все годы', value: '' },
                ...filterOptions.years.map((year) => ({ label: year, value: year })),
              ]}
              onValueChange={(value) => setFilter('year', value)}
            />
          </div>
          <div className="movie-filter-field">
            <span className="movie-filter-label">Оценка</span>
            <DropdownSelect
              ariaLabel="Фильтр по оценке"
              className="movie-filter-select"
              searchable
              scrollable
              value={filters.rating}
              options={ratingOptions}
              onValueChange={(value) => setFilter('rating', value)}
            />
          </div>
        </div>
      )}
    </>
  )
}
