import type { Movie } from '@entities/movie'

export interface MovieDistributionItem {
  average: number
  count: number
  label: string
}

interface MutableDistributionItem {
  count: number
  ratingCount: number
  ratingSum: number
}

function buildDistribution(movies: Movie[], getLabels: (movie: Movie) => string[]): MovieDistributionItem[] {
  const items = new Map<string, MutableDistributionItem>()

  for (const movie of movies) {
    for (const label of new Set(getLabels(movie).filter(Boolean))) {
      const item = items.get(label) ?? { count: 0, ratingCount: 0, ratingSum: 0 }
      item.count += 1
      if (movie.user_rating !== null) {
        item.ratingCount += 1
        item.ratingSum += movie.user_rating
      }
      items.set(label, item)
    }
  }

  return [...items].map(([label, item]) => ({
    average: item.ratingCount === 0 ? 0 : item.ratingSum / item.ratingCount,
    count: item.count,
    label,
  }))
}

export function buildDirectorDistribution(movies: Movie[]): MovieDistributionItem[] {
  return buildDistribution(movies, (movie) => movie.directors.filter((director) => director !== 'Спецвыпуск'))
}

export function buildGenreDistribution(movies: Movie[]): MovieDistributionItem[] {
  return buildDistribution(movies, (movie) => [movie.genre])
}
