import energyDrinksJson from '@data/energy-drinks/energy-drinks.json'
import { parseEnergyDrinksJson } from '@entities/energy-drink'
import { EnergyDrinkTierList } from '@widgets/EnergyDrinkTierList'

const energyDrinks = parseEnergyDrinksJson(energyDrinksJson)

export function EnergyDrinksPage() {
  return <main><EnergyDrinkTierList drinks={energyDrinks} /></main>
}
