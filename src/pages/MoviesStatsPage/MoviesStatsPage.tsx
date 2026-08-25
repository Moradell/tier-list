import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadMovies, type Movie } from '@entities/movie'
import { BackLink } from '@shared/ui/BackLink'
import {
  buildActorDistribution,
  buildCountryDistribution,
  buildDirectorDistribution,
  buildGenreDistribution,
  MovieDistributionChart,
  type MovieDistributionKind,
} from '@widgets/MovieStatistics'
import './MoviesStatsPage.scss'

interface MovieStatistics {
  animeAverage: number | null
  filmsAverage: number | null
  seriesAverage: number | null
  total: number
  distributionMovies: Movie[]
}

function calculateAverage(movies: Movie[]): number | null {
  const ratings = movies.flatMap(({ user_rating }) => user_rating === null ? [] : [user_rating])
  if (ratings.length === 0) return null
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
}

function formatAverage(value: number | null): string {
  return value === null
    ? '—'
    : value.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
}

export function MoviesStatsPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [statistics, setStatistics] = useState<MovieStatistics | null>(null)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const returnTo = typeof state?.returnTo === 'string'
    && state.returnTo.startsWith('/movies/')
    && state.returnTo !== '/movies/stats'
    ? state.returnTo
    : '/movies/films'

  useEffect(() => {
    let active = true
    Promise.all([loadMovies('film'), loadMovies('series'), loadMovies('anime')])
      .then(([films, series, anime]) => {
        if (!active) return
        setStatistics({
          animeAverage: calculateAverage(anime),
          filmsAverage: calculateAverage(films),
          seriesAverage: calculateAverage(series),
          total: films.length + series.length + anime.length,
          distributionMovies: [...films, ...series],
        })
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error : new Error(String(error)))
      })
    return () => { active = false }
  }, [])

  if (loadError) throw loadError

  const openFilteredCatalog = (filter: MovieDistributionKind, value: string) => {
    navigate({ pathname: returnTo, search: new URLSearchParams({ [filter]: value }).toString() })
  }

  return (
    <main className="movies-stats-page">
      <header className="movies-stats-page__header">
        <BackLink label="К фильмам" to={returnTo} />
        <div>
          <span>Фильмотека</span>
          <h1>Статистика фильмов</h1>
        </div>
      </header>

      {statistics ? (
        <>
          <section className="movie-stats-summary" aria-label="Основные показатели фильмотеки">
            <article className="movie-stats-summary__total">
              <span>Всего просмотрено</span>
              <strong>{statistics.total.toLocaleString('ru-RU')}</strong>
            </article>
            <article>
              <span>Средняя оценка фильмов</span>
              <strong>{formatAverage(statistics.filmsAverage)}</strong>
            </article>
            <article>
              <span>Средняя оценка сериалов</span>
              <strong>{formatAverage(statistics.seriesAverage)}</strong>
            </article>
            <article>
              <span>Средняя оценка аниме</span>
              <strong>{formatAverage(statistics.animeAverage)}</strong>
            </article>
          </section>
          <MovieDistributionChart
            distributions={{
              actor: buildActorDistribution(statistics.distributionMovies),
              country: buildCountryDistribution(statistics.distributionMovies),
              director: buildDirectorDistribution(statistics.distributionMovies),
              genre: buildGenreDistribution(statistics.distributionMovies),
            }}
            onItemSelect={openFilteredCatalog}
          />
        </>
      ) : (
        <div className="movies-stats-page__loader" role="status" aria-label="Загружаем статистику">
          <span aria-hidden="true" />
        </div>
      )}
    </main>
  )
}
