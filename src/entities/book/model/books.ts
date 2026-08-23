import { z } from 'zod'

export const BOOK_TIERS = ['S', 'A', 'B', 'C', 'D', 'F'] as const

const rating = z.string().regex(/^(?:[0-4](?:[.,]\d)?|5(?:[.,]0)?)$/, 'ожидалась оценка от 0 до 5')

export const BookSchema = z.object({
  tier: z.enum(BOOK_TIERS),
  position: z.string().regex(/^[1-9]\d*$/, 'ожидался положительный порядковый номер'),
  title: z.string().trim().min(1, 'название не может быть пустым'),
  author: z.string().trim().min(1, 'автор не может быть пустым'),
  user_rating: rating,
  livelib_rating: rating,
  url: z.string().url().regex(/^https:\/\/(?:www\.)?livelib\.ru\/book\/\d+/, 'ожидалась ссылка на книгу LiveLib'),
  cover: z.string().regex(/^\/covers\/[^/]+\.(?:jpe?g|png|webp)$/i, 'ожидался путь к локальной обложке'),
  year: z.string().trim().min(1, 'год публикации не может быть пустым'),
  read_date: z.string().regex(/^(?:-|\d{4}-\d{2}(?:-\d{2})?)$/, 'ожидалась дата YYYY-MM, YYYY-MM-DD или прочерк'),
}).strict()

export type BookRecord = z.infer<typeof BookSchema>
export type BookTier = (typeof BOOK_TIERS)[number]

const BooksFileSchema = z.array(BookSchema)

function formatIssues(issues: z.core.$ZodIssue[]): string {
  return issues.map((issue) => `${issue.path.join('.') || 'строка'}: ${issue.message}`).join('; ')
}

export function parseBooksJson(value: unknown, sourceName = 'JSON'): BookRecord[] {
  const result = BooksFileSchema.safeParse(value)
  if (!result.success) throw new Error(`${sourceName}: ${formatIssues(result.error.issues)}`)
  return result.data
}
