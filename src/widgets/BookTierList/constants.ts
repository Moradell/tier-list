import type { BookTier } from '@entities/book'

interface TierDefinition {
  name: BookTier
  color: string
}

export const TIERS: TierDefinition[] = [
  { name: 'S', color: '#ff7f84' },
  { name: 'A', color: '#ffbc7d' },
  { name: 'B', color: '#ffdd85' },
  { name: 'C', color: '#ffff83' },
  { name: 'D', color: '#b5fa7b' },
  { name: 'F', color: '#7ee7a0' },
]
