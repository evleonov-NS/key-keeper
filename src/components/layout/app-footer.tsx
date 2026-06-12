import { useEffect, useState } from 'react'
import {
  APP_AUTHOR,
  APP_VERSION,
  formatLocalDateTime,
} from '../../constants/app-info'

export function AppFooter() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <footer className="mt-auto border-t border-border bg-surface-elevated/60">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <p className="text-center text-xs text-muted">
          key-keeper v{APP_VERSION} · {APP_AUTHOR} · {formatLocalDateTime(now)}
        </p>
      </div>
    </footer>
  )
}
