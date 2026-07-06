import {
  APP_AUTHOR,
  APP_VERSION,
  formatAppReleaseDate,
} from '../../constants/app-info'

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-elevated/60">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <p className="text-center text-xs text-muted">
          key-keeper v{APP_VERSION} · {APP_AUTHOR} · {formatAppReleaseDate()}
        </p>
      </div>
    </footer>
  )
}
