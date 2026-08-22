export function formatReadDate(readDate: string): string {
  const match = readDate.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/)
  if (!match) return readDate === '-' ? '—' : 'Дата чтения не указана'

  const [, year, month, day] = match
  return day ? `${day}.${month}.${year}` : `${month}.${year}`
}
