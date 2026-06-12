import { AppRoot } from './components/app-root'
import { initTheme } from './utils/theme'

const initialTheme = initTheme()

export default function App() {
  return <AppRoot initialTheme={initialTheme} />
}
