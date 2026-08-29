import { EnergyDrinkCard, ENERGY_DRINK_TIERS, type EnergyDrink } from '@entities/energy-drink'
import './EnergyDrinkTierList.scss'

interface EnergyDrinkTierListProps {
  drinks: EnergyDrink[]
}

const colors = ['#ff7f7f', '#ffbf7f', '#ffdf7f', '#ffff7f', '#bfff7f', '#7fff7f']

export function EnergyDrinkTierList({ drinks }: EnergyDrinkTierListProps) {
  const byPosition = (left: EnergyDrink, right: EnergyDrink) => left.position - right.position
  const rows = ENERGY_DRINK_TIERS.map((tier, index) => ({
    label: tier,
    color: colors[index],
    drinks: drinks.filter((drink) => drink.visible && drink.tier === tier).sort(byPosition),
  }))

  return (
    <div className="energy-tier-list" aria-label="Тир-лист энергетиков">
      {rows.map((row) => (
        <section className="energy-tier-row" key={row.label} aria-label={`Тир ${row.label}`}>
          <div className="energy-tier-label" style={{ backgroundColor: row.color }}>
            <span>{row.label}</span>
            <small>{row.drinks.length}</small>
          </div>
          <div className="energy-tier-content">
            {row.drinks.map((drink) => <EnergyDrinkCard drink={drink} key={`${drink.brand}-${drink.flavor}`} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
