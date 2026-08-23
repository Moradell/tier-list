import { z } from 'zod'

const HISTORY_TIERS = ['S', 'A', 'B', 'C', 'D', 'F'] as const

const BookHistoryPositionSchema = z.object({
  tier: z.enum(HISTORY_TIERS),
  position: z.number().int().positive(),
})

const BookHistoryBookSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['Роман', 'Рассказ', 'Манга', 'Вне рейтинга']),
  title: z.string().min(1),
  author: z.string().min(1),
  cover: z.string().min(1),
  url: z.string().url(),
})

export const BookHistoryEventSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['move', 'new']),
  book: BookHistoryBookSchema,
  from: BookHistoryPositionSchema.nullable(),
  to: BookHistoryPositionSchema,
  createdAt: z.string().datetime({ offset: true }),
})

export const BookHistoryDataSchema = z.object({
  version: z.literal(1),
  knownBookIds: z.array(z.string()).refine((ids) => new Set(ids).size === ids.length, 'ID книг должны быть уникальными'),
  events: z.array(BookHistoryEventSchema),
})

export type BookHistoryEvent = z.infer<typeof BookHistoryEventSchema>
export type BookHistoryData = z.infer<typeof BookHistoryDataSchema>

export function parseBookHistory(value: unknown): BookHistoryData {
  return BookHistoryDataSchema.parse(value)
}
