import { Link } from 'react-router-dom'
import './BackLink.scss'

interface BackLinkProps {
  label: string
  to: string
}

export function BackLink({ label, to }: BackLinkProps) {
  return (
    <Link className="section-back-link" to={to} aria-label={label} title={label}>
      <span className="section-back-link__arrow" aria-hidden="true">←</span>
      <span>{label}</span>
    </Link>
  )
}
