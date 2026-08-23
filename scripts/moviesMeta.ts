import { readFile, rename, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDirectory = path.join(root, 'data/movies')
const categoryFiles = {
  film: 'movies.json',
  series: 'series.json',
  anime: 'anime.json',
} as const

async function countItems(file: string): Promise<number> {
  const value = JSON.parse(await readFile(path.join(dataDirectory, file), 'utf8')) as unknown
  if (!Array.isArray(value)) throw new Error(`data/movies/${file}: ожидался JSON-массив`)
  return value.length
}

async function generateMovieCatalogMeta(): Promise<void> {
  const entries = await Promise.all(
    Object.entries(categoryFiles).map(async ([category, file]) => [category, await countItems(file)]),
  )
  const metadata = Object.fromEntries(entries)
  const targetPath = path.join(dataDirectory, 'catalog-meta.json')
  const temporaryPath = path.join(dataDirectory, '.catalog-meta.json.tmp')

  await writeFile(temporaryPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, targetPath)
  console.log(`✓ Метаданные фильмотеки: ${entries.map(([category, count]) => `${category}=${count}`).join(', ')}`)
}

await generateMovieCatalogMeta()
