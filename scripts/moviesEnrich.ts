import { readFile, rename, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDirectory = path.join(root, 'data/movies')
const categoryFiles = ['movies.json', 'series.json', 'anime.json'] as const
const endpoint = 'https://query.wikidata.org/sparql'
const batchSize = 200
const actorBatchSize = 100
const cachePath = path.join(dataDirectory, '.wikidata-enrichment-cache.json')

interface RawMovie {
  actors: string[]
  kp_id: number
  countries: string[]
  directors: string[]
  [key: string]: unknown
}

interface SparqlBinding {
  actorLabel?: { value: string }
  kpId: { value: string }
  countryLabel?: { value: string }
  directorLabel?: { value: string }
}

interface SparqlResponse {
  results: { bindings: SparqlBinding[] }
}

interface Details {
  actors: Set<string>
  countries: Set<string>
  directors: Set<string>
}

interface CachedDetails {
  actors?: string[]
  countries?: string[]
  directors?: string[]
}

function chunks<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  )
}

function buildMetadataQuery(ids: number[]): string {
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

function buildActorsQuery(ids: number[]): string {
  const values = ids.map(String).map((id) => `"${id}"`).join(' ')
  return `
SELECT ?kpId ?actorLabel WHERE {
  VALUES ?kpId { ${values} }
  ?work wdt:P2603 ?kpId;
        wdt:P161 ?actor.
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "ru,en".
    ?actor rdfs:label ?actorLabel.
  }
}`
}

async function fetchBatch(
  ids: number[],
  buildQuery: (batchIds: number[]) => string,
  attempt = 1,
): Promise<SparqlBinding[]> {
  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        accept: 'application/sparql-results+json',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'user-agent': 'tier-list-movie-enrichment/1.0 (personal catalog)',
      },
      body: new URLSearchParams({ query: buildQuery(ids) }),
    })
  } catch (error) {
    if (attempt < 4) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_500))
      return fetchBatch(ids, buildQuery, attempt + 1)
    }
    throw error
  }

  if (!response.ok) {
    if (attempt < 4 && (response.status === 429 || response.status >= 500)) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_500))
      return fetchBatch(ids, buildQuery, attempt + 1)
    }
    throw new Error(`Wikidata вернула ${response.status}: ${await response.text()}`)
  }

  try {
    const value = JSON.parse(await response.text()) as SparqlResponse
    return value.results.bindings
  } catch (error) {
    if (attempt < 4) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_500))
      return fetchBatch(ids, buildQuery, attempt + 1)
    }
    throw error
  }
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
  const pendingMetadataIds = [...new Set(catalogs.flatMap(({ movies }) => movies
    .filter((movie) => movie.countries.length === 0 || movie.directors.length === 0)
    .map((movie) => movie.kp_id)))]
  const pendingActorIds = [...new Set(catalogs.flatMap(({ movies }) => movies
    .filter((movie) => movie.actors.length === 0)
    .map((movie) => movie.kp_id)))]

  if (pendingMetadataIds.length === 0 && pendingActorIds.length === 0) {
    console.log('✓ Страны, режиссёры и актёры уже заполнены для всего каталога')
    return
  }

  const cache = await loadCache()
  const detailsById = new Map<number, Details>(Object.entries(cache).map(([id, details]) => [
    Number(id),
    {
      actors: new Set(details.actors ?? []),
      countries: new Set(details.countries ?? []),
      directors: new Set(details.directors ?? []),
    },
  ]))
  const metadataIds = pendingMetadataIds.filter((id) => {
    const cached = cache[id]
    return cached?.countries === undefined || cached.directors === undefined
  })
  const metadataBatches = chunks(metadataIds, batchSize)
  for (const [index, batch] of metadataBatches.entries()) {
    const bindings = await fetchBatch(batch, buildMetadataQuery)
    for (const id of batch) {
      if (!detailsById.has(id)) detailsById.set(id, { actors: new Set(), countries: new Set(), directors: new Set() })
    }
    for (const binding of bindings) {
      const id = Number(binding.kpId.value)
      const details = detailsById.get(id) ?? { actors: new Set(), countries: new Set(), directors: new Set() }
      if (binding.countryLabel) details.countries.add(binding.countryLabel.value)
      if (binding.directorLabel) details.directors.add(binding.directorLabel.value)
      detailsById.set(id, details)
    }
    for (const id of batch) {
      const details = detailsById.get(id)!
      cache[id] = {
        ...cache[id],
        countries: uniqueSorted(details.countries),
        directors: uniqueSorted(details.directors),
      }
    }
    await writeCache(cache)
    console.log(`  Wikidata metadata: пакет ${index + 1}/${metadataBatches.length}`)
  }

  const actorIds = pendingActorIds.filter((id) => cache[id]?.actors === undefined)
  const actorBatches = chunks(actorIds, actorBatchSize)
  for (const [index, batch] of actorBatches.entries()) {
    const bindings = await fetchBatch(batch, buildActorsQuery)
    for (const id of batch) {
      if (!detailsById.has(id)) detailsById.set(id, { actors: new Set(), countries: new Set(), directors: new Set() })
    }
    for (const binding of bindings) {
      const id = Number(binding.kpId.value)
      const details = detailsById.get(id) ?? { actors: new Set(), countries: new Set(), directors: new Set() }
      if (binding.actorLabel) details.actors.add(binding.actorLabel.value)
      detailsById.set(id, details)
    }
    for (const id of batch) {
      const details = detailsById.get(id)!
      cache[id] = { ...cache[id], actors: uniqueSorted(details.actors) }
    }
    await writeCache(cache)
    console.log(`  Wikidata актёры: пакет ${index + 1}/${actorBatches.length}, кешировано ${Object.keys(cache).length}`)
  }

  let actorsAdded = 0
  let countriesAdded = 0
  let directorsAdded = 0
  let matched = 0
  for (const { file, movies } of catalogs) {
    for (const movie of movies) {
      const details = detailsById.get(movie.kp_id)
      if (!details) continue
      matched += 1
      if (movie.actors.length === 0 && details.actors.size > 0) {
        movie.actors = uniqueSorted(details.actors)
        actorsAdded += 1
      }
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

  console.log(`✓ Сопоставлено ${matched}; страны: ${countriesAdded}, режиссёры: ${directorsAdded}, актёры: ${actorsAdded}`)
}

await enrichMovies()
