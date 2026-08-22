import { z } from 'zod'

const HISTORY_TIERS = ['S', 'A', 'B', 'C', 'D', 'F'] as const

const HistoryPositionSchema = z.object({
  tier: z.enum(HISTORY_TIERS),
  position: z.number().int().positive(),
})

const HistoryBookSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['Роман', 'Рассказ', 'Манга', 'Вне рейтинга']),
  title: z.string().min(1),
  author: z.string().min(1),
  cover: z.string().min(1),
  url: z.string().url(),
})

export const HistoryEventSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['move', 'new']),
  book: HistoryBookSchema,
  from: HistoryPositionSchema.nullable(),
  to: HistoryPositionSchema,
  createdAt: z.string().datetime({ offset: true }),
})

export const HistoryDataSchema = z.object({
  version: z.literal(1),
  knownBookIds: z.array(z.string()).refine((ids) => new Set(ids).size === ids.length, 'ID книг должны быть уникальными'),
  events: z.array(HistoryEventSchema),
})

export type HistoryEvent = z.infer<typeof HistoryEventSchema>
export type HistoryData = z.infer<typeof HistoryDataSchema>

export function parseHistory(value: unknown): HistoryData {
  return HistoryDataSchema.parse(value)
}
