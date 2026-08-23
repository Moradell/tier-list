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
  const { pathname } = useLocation()

  return (
    <MovieCatalogFiltersProvider resetKey={pathname}>
      <MovieCatalogControls
        navigation={<Tabs ariaLabel="Категории фильмотеки" items={movieSections} level="secondary" />}
      />
      <Outlet />
    </MovieCatalogFiltersProvider>
  )
}
