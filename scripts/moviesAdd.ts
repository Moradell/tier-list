import { readFile, rename, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDirectory = path.join(root, 'data/movies')
const apiBaseUrl = 'https://kinopoiskapiunofficial.tech/api'

type Category = 'film' | 'series' | 'anime'

interface FilmDetails {
  countries?: Array<{ country?: string }>
  filmLength?: number | null
  genres?: Array<{ genre?: string }>
  kinopoiskId?: number
  nameOriginal?: string | null
  nameRu?: string | null
  nameEn?: string | null
  posterUrl?: string
  serial?: boolean
  type?: string
  year?: number | null
}

interface StaffMember {
  nameEn?: string | null
  nameRu?: string | null
  professionKey?: string
}

interface SeasonsResponse {
  items?: Array<{ episodes?: unknown[] }>
}

interface StoredMovie {
  kp_id: number
  [key: string]: unknown
}

const categoryFiles: Record<Category, string> = {
  film: 'movies.json',
  series: 'series.json',
  anime: 'anime.json',
}

function parseKinopoiskId(value: string): number {
  const input = value.trim()
  const urlMatch = input.match(/^https?:\/\/(?:www\.)?kinopoisk\.ru\/(?:film|series)\/(\d+)(?:\/|[?#]|$)/i)
  const id = urlMatch ? Number(urlMatch[1]) : /^\d+$/.test(input) ? Number(input) : Number.NaN
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('Укажите ссылку вида https://www.kinopoisk.ru/film/123456/ или числовой ID')
  }
  return id
}

function parseRating(value: string): number {
  const rating = Number(value.trim())
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    throw new Error('Оценка должна быть целым числом от 1 до 10')
  }
  return rating
}

function uniqueNames(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))]
}

function categoryFor(details: FilmDetails): Category {
  const genres = details.genres?.map(({ genre }) => genre?.toLocaleLowerCase('ru')) ?? []
  if (genres.includes('аниме')) return 'anime'
  if (details.serial || ['TV_SERIES', 'MINI_SERIES', 'TV_SHOW'].includes(details.type ?? '')) return 'series'
  return 'film'
}

function ratingSentiment(rating: number): 'negative' | 'neutral' | 'positive' {
  if (rating <= 4) return 'negative'
  if (rating <= 6) return 'neutral'
  return 'positive'
}

async function fetchApi<T>(pathname: string, apiKey: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${pathname}`, {
    headers: { accept: 'application/json', 'X-API-KEY': apiKey },
  })
  if (response.status === 401 || response.status === 403) {
    throw new Error('Kinopoisk API отклонил KINOPOISK_API_KEY. Проверьте токен в .env.local')
  }
  if (!response.ok) throw new Error(`Kinopoisk API вернул ${response.status}: ${await response.text()}`)
  return response.json() as Promise<T>
}

async function assertNotExists(id: number): Promise<void> {
  for (const file of Object.values(categoryFiles)) {
    const movies = JSON.parse(await readFile(path.join(dataDirectory, file), 'utf8')) as StoredMovie[]
    if (movies.some((movie) => movie.kp_id === id)) {
      throw new Error(`Запись ${id} уже существует в data/movies/${file}`)
    }
  }
}

async function writeJsonAtomically(targetPath: string, value: unknown): Promise<void> {
  const temporaryPath = `${targetPath}.tmp`
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, targetPath)
}

async function run(): Promise<void> {
  const apiKey = process.env.KINOPOISK_API_KEY?.trim()
  if (!apiKey) throw new Error('Добавьте KINOPOISK_API_KEY в .env.local')

  const prompt = createInterface({ input: stdin, output: stdout })
  try {
    const source = process.argv[2] ?? await prompt.question('Ссылка на фильм или сериал: ')
    const id = parseKinopoiskId(source)
    await assertNotExists(id)

    const [details, staff] = await Promise.all([
      fetchApi<FilmDetails>(`/v2.2/films/${id}`, apiKey),
      fetchApi<StaffMember[]>(`/v1/staff?filmId=${id}`, apiKey),
    ])
    const title = details.nameRu || details.nameEn || details.nameOriginal
    if (!title || !details.posterUrl) throw new Error('API не вернул название или постер')

    const category = categoryFor(details)
    const genres = uniqueNames(details.genres?.map(({ genre }) => genre) ?? [])
    const primaryGenre = category === 'anime' ? 'аниме' : (genres[0] ?? 'неизвестно')
    const actors = uniqueNames(staff.filter(({ professionKey }) => professionKey === 'ACTOR').map(({ nameRu, nameEn }) => nameRu || nameEn))
    const directors = uniqueNames(staff.filter(({ professionKey }) => professionKey === 'DIRECTOR').map(({ nameRu, nameEn }) => nameRu || nameEn))
    const countries = uniqueNames(details.countries?.map(({ country }) => country) ?? [])

    let episodeCount = 0
    if (category !== 'film') {
      try {
        const seasons = await fetchApi<SeasonsResponse>(`/v2.2/films/${id}/seasons`, apiKey)
        episodeCount = seasons.items?.reduce((sum, season) => sum + (season.episodes?.length ?? 0), 0) ?? 0
      } catch {
        // Some titles have no seasons endpoint; the per-title duration remains useful.
      }
    }
    const perEpisodeMinutes = details.filmLength && details.filmLength > 0
      ? details.filmLength
      : category === 'anime' ? 20 : 45
    const duration = category === 'film' ? (details.filmLength || 90) : Math.max(1, episodeCount) * perEpisodeMinutes

    stdout.write(`\nНайдено: ${title} (${details.year ?? 'год неизвестен'})\n`)
    stdout.write(`Каталог: ${categoryFiles[category]}, жанр: ${primaryGenre}\n`)
    stdout.write(`Актёров: ${actors.length}, режиссёров: ${directors.length}, длительность: ${duration} мин.\n`)
    const rating = parseRating(await prompt.question('Ваша оценка (1–10): '))
    const confirmation = (await prompt.question('Добавить запись? [Y/n] ')).trim().toLocaleLowerCase('ru')
    if (confirmation && confirmation !== 'y' && confirmation !== 'yes' && confirmation !== 'д' && confirmation !== 'да') {
      stdout.write('Добавление отменено.\n')
      return
    }

    const timestamp = new Date().toISOString()
    const movie = {
      kp_id: id,
      kind: category === 'film' ? 'film' : 'series',
      url: `https://www.kinopoisk.ru/${category === 'film' ? 'film' : 'series'}/${id}/`,
      title,
      year: details.year ? String(details.year) : '',
      genre: primaryGenre,
      user_rating: rating,
      user_rating_sentiment: ratingSentiment(rating),
      rated_at: timestamp,
      poster: details.posterUrl,
      alt: `${title}. ${details.year ?? 'год неизвестен'}, ${primaryGenre}`,
      original_title: details.nameOriginal || details.nameEn || null,
      countries,
      detail_genres: genres.filter((genre) => genre !== primaryGenre),
      directors,
      actors,
      duration_min: Math.round(duration),
      list_id: null,
      list_name: null,
      list_position: null,
      added_at: timestamp,
    }

    const targetPath = path.join(dataDirectory, categoryFiles[category])
    const movies = JSON.parse(await readFile(targetPath, 'utf8')) as StoredMovie[]
    movies.unshift(movie)
    await writeJsonAtomically(targetPath, movies)
    stdout.write(`✓ Добавлено в data/movies/${categoryFiles[category]}\n`)
    stdout.write('Метаданные и история обновятся автоматически при npm run dev или npm run build.\n')
  } finally {
    prompt.close()
  }
}

try {
  await run()
} catch (error) {
  process.stderr.write(`Ошибка: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
}
