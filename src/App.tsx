import { AppLayout } from './components/layout/app-layout'
import { DemoPanel } from './components/demo/demo-panel'
import { initTheme } from './utils/theme'

const initialTheme = initTheme()

export default function App() {
  return (
    <AppLayout initialTheme={initialTheme}>
      <DemoPanel />
    </AppLayout>
  )
}
