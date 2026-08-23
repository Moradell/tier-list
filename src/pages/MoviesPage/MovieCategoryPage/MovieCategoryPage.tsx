import { useEffect, useState } from 'react'
import { loadMovies, type Movie, type MovieCategory } from '@entities/movie'
import {
  buildMovieFilterOptions,
  filterMovies,
  sortMovies,
  useMovieCatalogFilters,
} from '@features/filter-movie-catalog'
import { MovieList } from '@widgets/MovieList'

interface MovieCategoryPageProps {
  category: MovieCategory
}

const categoryTitles: Record<MovieCategory, string> = {
  film: 'Просмотренные фильмы',
  series: 'Просмотренные сериалы',
  anime: 'Просмотренное аниме',
}

export function MovieCategoryPage({ category }: MovieCategoryPageProps) {
  const { filters, searchQuery, setFilterOptions, sortOrder } = useMovieCatalogFilters()
  const [categoryMovies, setCategoryMovies] = useState<Movie[] | null>(null)
  const [loadError, setLoadError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true
    setCategoryMovies(null)
    setLoadError(null)

    loadMovies(category)
      .then((loadedMovies) => {
        if (active) {
          setCategoryMovies(loadedMovies)
          setFilterOptions(buildMovieFilterOptions(loadedMovies))
        }
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error : new Error(String(error)))
      })

    return () => {
      active = false
    }
  }, [category, setFilterOptions])

  if (loadError) throw loadError
  if (!categoryMovies) {
    return (
      <div className="movie-list-loader" role="status" aria-label="Загружаем каталог">
        <span aria-hidden="true" />
      </div>
    )
  }

  const filteredMovies = filterMovies(categoryMovies, filters, searchQuery)
  const sortedMovies = sortMovies(filteredMovies, sortOrder)

  return <MovieList movies={sortedMovies} searchQuery={searchQuery.trim()} title={categoryTitles[category]} />
}
