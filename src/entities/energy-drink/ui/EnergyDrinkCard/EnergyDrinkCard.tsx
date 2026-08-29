import type { EnergyDrink } from '../../model/energyDrink'
import './EnergyDrinkCard.scss'

interface EnergyDrinkCardProps {
  drink: EnergyDrink
}

export function EnergyDrinkCard({ drink }: EnergyDrinkCardProps) {
  const image = `${import.meta.env.BASE_URL}${drink.image.replace(/^\//, '')}`

  return (
    <article className="energy-drink-card">
      <div className="energy-drink-card__image-wrap">
        <img src={image} alt={`${drink.brand} — ${drink.flavor}`} loading="lazy" decoding="async" />
      </div>
      <h2>{drink.brand}</h2>
      <p>{drink.flavor}</p>
    </article>
  )
}
