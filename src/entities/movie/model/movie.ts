import { z } from 'zod'

const MovieSchema = z.object({
  kp_id: z.number().int().positive(),
  kind: z.enum(['film', 'series']),
  url: z.string().url(),
  title: z.string().min(1),
  year: z.string(),
  genre: z.string(),
  user_rating: z.number().min(0).max(10).nullable(),
  poster: z.string().url(),
  countries: z.array(z.string().min(1)),
  directors: z.array(z.string().min(1)),
  added_at: z.string().nullable(),
})

const MoviesFileSchema = z.array(MovieSchema)

export type Movie = z.infer<typeof MovieSchema>
export type MovieCategory = Movie['kind'] | 'anime'

export function parseMovies(value: unknown, sourceName: string, category: MovieCategory): Movie[] {
  const result = MoviesFileSchema.safeParse(value)

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('; ')

    throw new Error(`${sourceName}: ${issues}`)
  }

  const mismatchedMovie = result.data.find((movie) => {
    if (category === 'film') return movie.kind !== 'film'
    if (category === 'anime') return movie.kind !== 'series' || movie.genre !== 'аниме'
    return movie.kind !== 'series' || movie.genre === 'аниме'
  })
  if (mismatchedMovie) {
    throw new Error(`${sourceName}: запись ${mismatchedMovie.kp_id} не относится к категории ${category}`)
  }

  return result.data
}
