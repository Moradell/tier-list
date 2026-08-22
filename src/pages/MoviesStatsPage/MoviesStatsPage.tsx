import { BackLink } from '@shared/ui/BackLink'
import './MoviesStatsPage.scss'

export function MoviesStatsPage() {
  return (
    <main className="movies-stats-page">
      <BackLink label="К фильмам" to="/movies" />
      <div>
        <span>Фильмотека</span>
        <h1>Статистика фильмов</h1>
        <p>Здесь появится статистика, когда мы добавим фильмы.</p>
      </div>
    </main>
  )
}
