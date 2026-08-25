import { Outlet, useLocation } from 'react-router-dom'
import { MovieCatalogControls, MovieCatalogFiltersProvider } from '@features/filter-movie-catalog'
import { Tabs, type TabItem } from '@shared/ui/Tabs'
import movieCatalogMeta from '@data/movies/catalog-meta.json'
import './MoviesPage.scss'

const movieSections: TabItem[] = [
  { label: 'Фильмы', count: movieCatalogMeta.film, to: '/movies/films' },
  { label: 'Сериалы', count: movieCatalogMeta.series, to: '/movies/series' },
  { label: 'Аниме', count: movieCatalogMeta.anime, to: '/movies/anime' },
]

export function MoviesPage() {
  const { pathname, search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const initialFilters = {
    actor: searchParams.get('actor') ?? '',
    country: searchParams.get('country') ?? '',
    director: searchParams.get('director') ?? '',
    genre: searchParams.get('genre') ?? '',
    rating: searchParams.get('rating') ?? '',
    year: searchParams.get('year') ?? '',
  }

  return (
    <MovieCatalogFiltersProvider initialFilters={initialFilters} resetKey={`${pathname}${search}`}>
      <MovieCatalogControls
        navigation={<Tabs ariaLabel="Категории фильмотеки" items={movieSections} level="secondary" />}
      />
      <Outlet />
    </MovieCatalogFiltersProvider>
  )
}
