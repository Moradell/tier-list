import { readFile, rename, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { parseMovieHistory, type MovieHistoryData } from '@entities/movie/model/movieHistory'
import { parseMovies, type Movie, type MovieCategory } from '@entities/movie/model/movie'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDirectory = path.join(root, 'data/movies')
const historyPath = path.join(dataDirectory, 'history.json')
const categoryFiles: Record<MovieCategory, string> = {
  film: 'movies.json',
  series: 'series.json',
  anime: 'anime.json',
}

interface CategorizedMovie {
  category: MovieCategory
  movie: Movie
}

async function loadMovies(): Promise<CategorizedMovie[]> {
  const groups = await Promise.all(
    Object.entries(categoryFiles).map(async ([category, file]) => {
      const sourceName = `data/movies/${file}`
      const value = JSON.parse(await readFile(path.join(dataDirectory, file), 'utf8')) as unknown
      return parseMovies(value, sourceName, category as MovieCategory)
        .map((movie) => ({ category: category as MovieCategory, movie }))
    }),
  )
  return groups.flat()
}

function getAddedAt(movie: Movie): string {
  if (movie.added_at) {
    const timestamp = new Date(movie.added_at)
    if (!Number.isNaN(timestamp.getTime())) return timestamp.toISOString()
  }
  return new Date().toISOString()
}

async function writeHistory(history: MovieHistoryData): Promise<void> {
  const temporaryPath = `${historyPath}.tmp`
  await writeFile(temporaryPath, `${JSON.stringify(history, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, historyPath)
}

async function syncMovieHistory(): Promise<void> {
  const categorizedMovies = await loadMovies()
  let history: MovieHistoryData

  try {
    history = parseMovieHistory(JSON.parse(await readFile(historyPath, 'utf8')) as unknown)
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
    history = { version: 1, knownMovieIds: categorizedMovies.map(({ movie }) => movie.kp_id), events: [] }
    await writeHistory(history)
    console.log(`✓ Создана базовая отметка киноистории: ${history.knownMovieIds.length}`)
    return
  }

  const knownIds = new Set(history.knownMovieIds)
  const newItems = categorizedMovies.filter(({ movie }) => !knownIds.has(movie.kp_id))

  for (const { category, movie } of newItems) {
    history.knownMovieIds.push(movie.kp_id)
    history.events.push({
      id: `movie-new-${movie.kp_id}-${Date.now()}`,
      movie: { id: movie.kp_id, category, title: movie.title, poster: movie.poster, url: movie.url },
      createdAt: getAddedAt(movie),
    })
  }

  if (newItems.length > 0) await writeHistory(history)
  console.log(`✓ Киноистория: ${newItems.length} новых, ${history.events.length} событий`)
}

await syncMovieHistory()
