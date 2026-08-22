import Papa from 'papaparse'
import { z } from 'zod'

export const BOOK_TIERS = ['S', 'A', 'B', 'C', 'D', 'F'] as const

export const BOOK_COLUMNS = [
  'tier',
  'title',
  'author',
  'user_rating',
  'livelib_rating',
  'url',
  'cover',
  'year',
  'read_date',
] as const

const rating = z.string().regex(/^(?:[0-4](?:[.,]\d)?|5(?:[.,]0)?)$/, 'ожидалась оценка от 0 до 5')

export const BookSchema = z.object({
  tier: z.enum(BOOK_TIERS),
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

function formatIssues(issues: z.core.$ZodIssue[]): string {
  return issues.map((issue) => `${issue.path.join('.') || 'строка'}: ${issue.message}`).join('; ')
}

export function parseBooksCsv(csv: string, sourceName = 'CSV'): BookRecord[] {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(),
  })

  if (parsed.errors.length > 0) {
    const details = parsed.errors
      .map((error) => `строка ${(error.row ?? 0) + 2}: ${error.message}`)
      .join('; ')
    throw new Error(`${sourceName}: ошибка CSV: ${details}`)
  }

  const actualColumns = parsed.meta.fields ?? []
  if (actualColumns.join(',') !== BOOK_COLUMNS.join(',')) {
    throw new Error(`${sourceName}: ожидались колонки ${BOOK_COLUMNS.join(',')}`)
  }

  return parsed.data.map((row, index) => {
    const result = BookSchema.safeParse(row)
    if (!result.success) {
      throw new Error(`${sourceName}, строка ${index + 2}: ${formatIssues(result.error.issues)}`)
    }
    return result.data
  })
}
