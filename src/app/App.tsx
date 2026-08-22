import { HashRouter } from 'react-router-dom'
import { AppProviders } from './providers'
import { AppRouter } from './router'

export default function App() {
  return (
    <AppProviders>
      <HashRouter>
        <AppRouter />
      </HashRouter>
    </AppProviders>
  )
}
