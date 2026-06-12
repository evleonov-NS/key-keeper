import type { ReactNode } from 'react'
import { KeyRound } from 'lucide-react'
import { SessionControls } from '../auth/session-controls'
import { ThemeToggle } from '../ui/theme-toggle'
import { AppFooter } from './app-footer'
import { SidebarSearch } from './sidebar-search'
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
    <div className="flex min-h-screen flex-col">
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

          <div className="flex items-center gap-2">
            <SessionControls />
            <ThemeToggle initialTheme={initialTheme} />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:flex-row sm:px-6">
        <aside
          aria-label="Боковое меню"
          className="w-full shrink-0 sm:w-52"
        >
          <nav aria-label="Основная навигация">
            <ul className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
              {NAV_ITEMS.map((item) => (
                <li key={item.id} className="shrink-0 sm:shrink">
                  <button
                    type="button"
                    className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition-colors duration-theme hover:bg-surface-elevated hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white sm:w-full"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <SidebarSearch />
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <AppFooter />
    </div>
  )
}
