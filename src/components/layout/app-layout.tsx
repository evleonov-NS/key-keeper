import type { ReactNode } from 'react'
import { KeyRound } from 'lucide-react'
import { ThemeToggle } from '../ui/theme-toggle'
import type { Theme } from '../../utils/theme'

type NavItem = {
  id: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'licenses', label: 'Лицензии' },
  { id: 'categories', label: 'Категории' },
  { id: 'settings', label: 'Настройки' },
]

type AppLayoutProps = {
  children: ReactNode
  initialTheme: Theme
}

export function AppLayout({ children, initialTheme }: AppLayoutProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-surface-elevated/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
              <KeyRound size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">key-keeper</p>
              <p className="text-xs text-muted">Менеджер лицензий</p>
            </div>
          </div>

          <ThemeToggle initialTheme={initialTheme} />
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl gap-6 px-4 py-6 sm:px-6">
        <nav
          aria-label="Основная навигация"
          className="hidden w-44 shrink-0 sm:block"
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition-colors duration-theme hover:bg-surface-elevated hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
