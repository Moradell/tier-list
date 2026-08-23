import type { Book } from '@entities/book'

export interface StatisticItem {
  label: string
  value: number
}

export interface AuthorStatistic {
  author: string
  averageLivelibRating: number
  averageUserRating: number
  booksCount: number
}

export interface DecadeStatistic extends StatisticItem {
  averageUserRating: number
}

export interface BookStatisticsData {
  total: number
  averageUserRating: number
  averageLivelibRating: number
  byRating: StatisticItem[]
  byReadYear: StatisticItem[]
  byDecade: DecadeStatistic[]
  topAuthors: AuthorStatistic[]
}

function numberValue(value: string): number {
  return Number(value.replace(',', '.')) || 0
}

function countBy(books: Book[], getLabel: (book: Book) => string | null): Map<string, number> {
  const counts = new Map<string, number>()

  books.forEach((book) => {
    const label = getLabel(book)
    if (label) counts.set(label, (counts.get(label) ?? 0) + 1)
  })

  return counts
}

function mapItems(counts: Map<string, number>): StatisticItem[] {
  return [...counts].map(([label, value]) => ({ label, value }))
}

function average(books: Book[], getValue: (book: Book) => number): number {
  if (books.length === 0) return 0
  return books.reduce((sum, book) => sum + getValue(book), 0) / books.length
}

export function buildBookStatistics(books: Book[]): BookStatisticsData {
  const ratingCounts = countBy(books, (book) => String(numberValue(book.user_rating)))
  const readYearCounts = countBy(books, (book) => book.read_date === '-' ? 'N/A' : book.read_date.slice(0, 4))
  const decadeBooks = new Map<string, Book[]>()
  books.forEach((book) => {
    const year = Number.parseInt(book.year, 10)
    if (!Number.isFinite(year)) return
    const decade = `${Math.floor(year / 10) * 10}-е`
    decadeBooks.set(decade, [...(decadeBooks.get(decade) ?? []), book])
  })
  const authorBooks = new Map<string, Book[]>()
  books.forEach((book) => authorBooks.set(book.author, [...(authorBooks.get(book.author) ?? []), book]))

  return {
    total: books.length,
    averageUserRating: average(books, (book) => numberValue(book.user_rating)),
    averageLivelibRating: average(books, (book) => numberValue(book.livelib_rating)),
    byRating: mapItems(ratingCounts).sort((a, b) => Number(b.label) - Number(a.label)),
    byReadYear: mapItems(readYearCounts).sort((a, b) => {
      if (a.label === 'N/A') return 1
      if (b.label === 'N/A') return -1
      return a.label.localeCompare(b.label)
    }),
    byDecade: [...decadeBooks].map(([label, booksByDecade]) => ({
      label,
      value: booksByDecade.length,
      averageUserRating: average(booksByDecade, (book) => numberValue(book.user_rating)),
    })).sort((a, b) => Number.parseInt(a.label, 10) - Number.parseInt(b.label, 10)),
    topAuthors: [...authorBooks].map(([author, booksByAuthor]) => ({
      author,
      booksCount: booksByAuthor.length,
      averageUserRating: average(booksByAuthor, (book) => numberValue(book.user_rating)),
      averageLivelibRating: average(booksByAuthor, (book) => numberValue(book.livelib_rating)),
    })).sort((a, b) => b.booksCount - a.booksCount || a.author.localeCompare(b.author)),
  }
}
