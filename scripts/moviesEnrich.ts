import { readFile, rename, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDirectory = path.join(root, 'data/movies')
const categoryFiles = ['movies.json', 'series.json', 'anime.json'] as const
const endpoint = 'https://query.wikidata.org/sparql'
const batchSize = 200
const cachePath = path.join(dataDirectory, '.wikidata-enrichment-cache.json')

interface RawMovie {
  kp_id: number
  countries: string[]
  directors: string[]
  [key: string]: unknown
}

interface SparqlBinding {
  kpId: { value: string }
  countryLabel?: { value: string }
  directorLabel?: { value: string }
}

interface SparqlResponse {
  results: { bindings: SparqlBinding[] }
}

interface Details {
  countries: Set<string>
  directors: Set<string>
}

interface CachedDetails {
  countries: string[]
  directors: string[]
}

function chunks<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  )
}

function buildQuery(ids: number[]): string {
  const values = ids.map(String).map((id) => `"${id}"`).join(' ')
  return `
SELECT ?kpId ?countryLabel ?directorLabel WHERE {
  VALUES ?kpId { ${values} }
  ?work wdt:P2603 ?kpId.
  OPTIONAL { ?work wdt:P495 ?country. }
  OPTIONAL { ?work wdt:P57 ?director. }
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "ru,en".
    ?country rdfs:label ?countryLabel.
    ?director rdfs:label ?directorLabel.
  }
}`
}

async function fetchBatch(ids: number[], attempt = 1): Promise<SparqlBinding[]> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      accept: 'application/sparql-results+json',
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'user-agent': 'tier-list-movie-enrichment/1.0 (personal catalog)',
    },
    body: new URLSearchParams({ query: buildQuery(ids) }),
  })

  if (!response.ok) {
    if (attempt < 4 && (response.status === 429 || response.status >= 500)) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_500))
      return fetchBatch(ids, attempt + 1)
    }
    throw new Error(`Wikidata вернула ${response.status}: ${await response.text()}`)
  }

  const value = await response.json() as SparqlResponse
  return value.results.bindings
}

function uniqueSorted(values: Set<string>): string[] {
  return [...values]
    .filter((value) => !/^Q\d+$/.test(value))
    .sort((left, right) => left.localeCompare(right, 'ru'))
}

async function loadCache(): Promise<Record<string, CachedDetails>> {
  try {
    return JSON.parse(await readFile(cachePath, 'utf8')) as Record<string, CachedDetails>
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return {}
    throw error
  }
}

async function writeCache(cache: Record<string, CachedDetails>): Promise<void> {
  const temporaryPath = `${cachePath}.tmp`
  await writeFile(temporaryPath, `${JSON.stringify(cache, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, cachePath)
}

async function enrichMovies(): Promise<void> {
  const catalogs = await Promise.all(categoryFiles.map(async (file) => {
    const value = JSON.parse(await readFile(path.join(dataDirectory, file), 'utf8')) as RawMovie[]
    return { file, movies: value }
  }))
  const pendingIds = [...new Set(catalogs.flatMap(({ movies }) => movies
    .filter((movie) => movie.countries.length === 0 || movie.directors.length === 0)
    .map((movie) => movie.kp_id)))]

  if (pendingIds.length === 0) {
    console.log('✓ Страны и режиссёры уже заполнены для всего каталога')
    return
  }

  const cache = await loadCache()
  const detailsById = new Map<number, Details>(Object.entries(cache).map(([id, details]) => [
    Number(id),
    { countries: new Set(details.countries), directors: new Set(details.directors) },
  ]))
  const uncachedIds = pendingIds.filter((id) => !(String(id) in cache))
  const batches = chunks(uncachedIds, batchSize)
  for (const [index, batch] of batches.entries()) {
    const bindings = await fetchBatch(batch)
    for (const id of batch) detailsById.set(id, { countries: new Set(), directors: new Set() })
    for (const binding of bindings) {
      const id = Number(binding.kpId.value)
      const details = detailsById.get(id) ?? { countries: new Set(), directors: new Set() }
      if (binding.countryLabel) details.countries.add(binding.countryLabel.value)
      if (binding.directorLabel) details.directors.add(binding.directorLabel.value)
      detailsById.set(id, details)
    }
    for (const id of batch) {
      const details = detailsById.get(id)!
      cache[id] = {
        countries: uniqueSorted(details.countries),
        directors: uniqueSorted(details.directors),
      }
    }
    await writeCache(cache)
    console.log(`  Wikidata: пакет ${index + 1}/${batches.length}, кешировано ${Object.keys(cache).length}`)
  }

  let countriesAdded = 0
  let directorsAdded = 0
  let matched = 0
  for (const { file, movies } of catalogs) {
    for (const movie of movies) {
      const details = detailsById.get(movie.kp_id)
      if (!details) continue
      matched += 1
      if (movie.countries.length === 0 && details.countries.size > 0) {
        movie.countries = uniqueSorted(details.countries)
        countriesAdded += 1
      }
      if (movie.directors.length === 0 && details.directors.size > 0) {
        movie.directors = uniqueSorted(details.directors)
        directorsAdded += 1
      }
    }

    const targetPath = path.join(dataDirectory, file)
    const temporaryPath = `${targetPath}.tmp`
    await writeFile(temporaryPath, `${JSON.stringify(movies, null, 2)}\n`, 'utf8')
    await rename(temporaryPath, targetPath)
  }

  console.log(`✓ Сопоставлено ${matched}/${pendingIds.length}; страны: ${countriesAdded}, режиссёры: ${directorsAdded}`)
}

await enrichMovies()
