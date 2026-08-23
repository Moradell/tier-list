import { z } from 'zod'

export const MovieHistoryEventSchema = z.object({
  id: z.string().min(1),
  movie: z.object({
    id: z.number().int().positive(),
    category: z.enum(['film', 'series', 'anime']),
    title: z.string().min(1),
    poster: z.string().url(),
    url: z.string().url(),
  }),
  createdAt: z.string().datetime({ offset: true }),
})

export const MovieHistoryDataSchema = z.object({
  version: z.literal(1),
  knownMovieIds: z.array(z.number().int().positive())
    .refine((ids) => new Set(ids).size === ids.length, 'ID фильмов должны быть уникальными'),
  events: z.array(MovieHistoryEventSchema),
})

export type MovieHistoryEvent = z.infer<typeof MovieHistoryEventSchema>
export type MovieHistoryData = z.infer<typeof MovieHistoryDataSchema>

export function parseMovieHistory(value: unknown): MovieHistoryData {
  return MovieHistoryDataSchema.parse(value)
}
