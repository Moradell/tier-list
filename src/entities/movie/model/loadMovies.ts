import { parseMovies, type Movie, type MovieCategory } from './movie'

const movieLoaders: Record<MovieCategory, () => Promise<{ default: unknown }>> = {
  film: () => import('@data/movies/movies.json'),
  series: () => import('@data/movies/series.json'),
  anime: () => import('@data/movies/anime.json'),
}

const sourceNames: Record<MovieCategory, string> = {
  film: 'data/movies/movies.json',
  series: 'data/movies/series.json',
  anime: 'data/movies/anime.json',
}

export async function loadMovies(category: MovieCategory): Promise<Movie[]> {
  const module = await movieLoaders[category]()
  return parseMovies(module.default, sourceNames[category], category)
}
