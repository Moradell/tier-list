import { readFile, rename, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDirectory = path.join(root, 'data/movies')
const categoryFiles = ['movies.json', 'series.json', 'anime.json'] as const
const cachePath = path.join(dataDirectory, '.kinopoisk-enrichment-cache.json')
const apiBaseUrl = 'https://kinopoiskapiunofficial.tech/api'
const requestIntervalMs = 100

interface RawMovie {
  kp_id: number
  title: string
  countries: string[]
  directors: string[]
  [key: string]: unknown
}

interface FilmResponse {
  countries?: Array<{ country?: string }>
}

interface StaffMember {
  nameEn?: string | null
  nameRu?: string | null
  professionKey?: string
}

interface CachedDetails {
  countries?: string[]
  directors?: string[]
}

type EnrichmentCache = Record<string, CachedDetails>

function uniqueSorted(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim()))]
    .sort((left, right) => left.localeCompare(right, 'ru'))
}

async function loadCache(): Promise<EnrichmentCache> {
  try {
    return JSON.parse(await readFile(cachePath, 'utf8')) as EnrichmentCache
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return {}
    throw error
  }
}

async function writeJsonAtomically(targetPath: string, value: unknown): Promise<void> {
  const temporaryPath = `${targetPath}.tmp`
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, targetPath)
}

async function wait(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function fetchApi<T>(pathName: string, apiKey: string, attempt = 1): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${pathName}`, {
    headers: {
      accept: 'application/json',
      'X-API-KEY': apiKey,
    },
  })

  if (!response.ok) {
    if (attempt < 4 && (response.status === 429 || response.status >= 500)) {
      const retryAfterSeconds = Number(response.headers.get('retry-after'))
      await wait(Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1_000 : attempt * 1_500)
      return fetchApi<T>(pathName, apiKey, attempt + 1)
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error('Kinopoisk API отклонил KINOPOISK_API_KEY. Проверьте токен в .env.local')
    }
    throw new Error(`Kinopoisk API вернул ${response.status}: ${await response.text()}`)
  }

  await wait(requestIntervalMs)
  return response.json() as Promise<T>
}

async function enrichMovies(): Promise<void> {
  const apiKey = process.env.KINOPOISK_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('Добавьте KINOPOISK_API_KEY в .env.local перед запуском npm run movies:enrich:kinopoisk')
  }

  const catalogs = await Promise.all(categoryFiles.map(async (file) => ({
    file,
    movies: JSON.parse(await readFile(path.join(dataDirectory, file), 'utf8')) as RawMovie[],
  })))
  const pendingMovies = catalogs.flatMap(({ movies }) => movies)
    .filter((movie) => movie.countries.length === 0 || movie.directors.length === 0)
  const cache = await loadCache()
  let requestCount = 0

  for (const [index, movie] of pendingMovies.entries()) {
    const cacheKey = String(movie.kp_id)
    const cached = cache[cacheKey] ?? {}

    if (movie.countries.length === 0 && cached.countries === undefined) {
      const film = await fetchApi<FilmResponse>(`/v2.2/films/${movie.kp_id}`, apiKey)
      cached.countries = uniqueSorted(film.countries?.map(({ country }) => country) ?? [])
      requestCount += 1
      cache[cacheKey] = cached
      await writeJsonAtomically(cachePath, cache)
    }

    if (movie.directors.length === 0 && cached.directors === undefined) {
      const staff = await fetchApi<StaffMember[]>(`/v1/staff?filmId=${movie.kp_id}`, apiKey)
      cached.directors = uniqueSorted(staff
        .filter(({ professionKey }) => professionKey === 'DIRECTOR')
        .map(({ nameRu, nameEn }) => nameRu || nameEn))
      requestCount += 1
      cache[cacheKey] = cached
      await writeJsonAtomically(cachePath, cache)
    }

    if ((index + 1) % 20 === 0 || index === pendingMovies.length - 1) {
      console.log(`  Кинопоиск: обработано ${index + 1}/${pendingMovies.length}, запросов ${requestCount}`)
    }
  }

  let countriesAdded = 0
  let directorsAdded = 0
  for (const { file, movies } of catalogs) {
    for (const movie of movies) {
      const cached = cache[String(movie.kp_id)]
      if (!cached) continue
      if (movie.countries.length === 0 && cached.countries?.length) {
        movie.countries = cached.countries
        countriesAdded += 1
      }
      if (movie.directors.length === 0 && cached.directors?.length) {
        movie.directors = cached.directors
        directorsAdded += 1
      }
    }
    await writeJsonAtomically(path.join(dataDirectory, file), movies)
  }

  console.log(`✓ Kinopoisk fallback: страны ${countriesAdded}, режиссёры ${directorsAdded}, запросов ${requestCount}`)
}

await enrichMovies()
