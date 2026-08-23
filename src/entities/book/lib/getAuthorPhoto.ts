import authorPhotos from '@data/authors/files.json'

const photos = authorPhotos as Record<string, string | null>

export const authorPhotoPlaceholder = `${import.meta.env.BASE_URL}authors/placeholder.svg`

export function getAuthorPhoto(author: string): string {
  const file = photos[author]
  return file
    ? `${import.meta.env.BASE_URL}authors/${file}`
    : authorPhotoPlaceholder
}
