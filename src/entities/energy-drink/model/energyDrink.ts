import { z } from 'zod'

export const ENERGY_DRINK_TIERS = ['S', 'A', 'B', 'C', 'D', 'F'] as const

const EnergyDrinkSchema = z.object({
  brand: z.string().trim().min(1),
  flavor: z.string().trim().min(1),
  tier: z.enum(ENERGY_DRINK_TIERS).nullable(),
  position: z.number().int().positive(),
  visible: z.boolean().default(true),
  image: z.string().regex(/^\/energy_drink\/[^/]+\.(?:jpe?g|png|webp)$/i),
}).strict()

const EnergyDrinksFileSchema = z.array(EnergyDrinkSchema).superRefine((drinks, context) => {
  const positions = new Set<string>()

  drinks.forEach((drink, index) => {
    const key = `${drink.tier ?? 'unranked'}:${drink.position}`

    if (positions.has(key)) {
      context.addIssue({
        code: 'custom',
        message: 'позиция должна быть уникальной внутри тира',
        path: [index, 'position'],
      })
    }

    positions.add(key)
  })
})

export type EnergyDrink = z.infer<typeof EnergyDrinkSchema>
export type EnergyDrinkTier = (typeof ENERGY_DRINK_TIERS)[number]

export function parseEnergyDrinksJson(value: unknown): EnergyDrink[] {
  return EnergyDrinksFileSchema.parse(value)
}
