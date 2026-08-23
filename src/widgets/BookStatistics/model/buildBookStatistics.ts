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

export interface BookStatisticsData {
  total: number
  averageUserRating: number
  averageLivelibRating: number
  byRating: StatisticItem[]
  byReadYear: StatisticItem[]
  byDecade: StatisticItem[]
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
  const datedBooks = books.filter((book) => book.read_date !== '-')
  const ratingCounts = countBy(books, (book) => String(numberValue(book.user_rating)))
  const readYearCounts = countBy(datedBooks, (book) => book.read_date.slice(0, 4))
  const decadeCounts = countBy(books, (book) => {
    const year = Number.parseInt(book.year, 10)
    return Number.isFinite(year) ? `${Math.floor(year / 10) * 10}-е` : null
  })
  const authorBooks = new Map<string, Book[]>()
  books.forEach((book) => authorBooks.set(book.author, [...(authorBooks.get(book.author) ?? []), book]))

  return {
    total: books.length,
    averageUserRating: average(books, (book) => numberValue(book.user_rating)),
    averageLivelibRating: average(books, (book) => numberValue(book.livelib_rating)),
    byRating: mapItems(ratingCounts).sort((a, b) => Number(b.label) - Number(a.label)),
    byReadYear: mapItems(readYearCounts).sort((a, b) => a.label.localeCompare(b.label)),
    byDecade: mapItems(decadeCounts).sort((a, b) => b.value - a.value).slice(0, 8),
    topAuthors: [...authorBooks].map(([author, booksByAuthor]) => ({
      author,
      booksCount: booksByAuthor.length,
      averageUserRating: average(booksByAuthor, (book) => numberValue(book.user_rating)),
      averageLivelibRating: average(booksByAuthor, (book) => numberValue(book.livelib_rating)),
    })).sort((a, b) => b.booksCount - a.booksCount || a.author.localeCompare(b.author)),
  }
}
