import type { ReactNode } from 'react'
import { KeyRound } from 'lucide-react'
import type { License } from '../../types/license'
import { SessionControls } from '../auth/session-controls'
import { ThemeToggle } from '../ui/theme-toggle'
import { AppFooter } from './app-footer'
import { SidebarAttention } from './sidebar-attention'
import { SidebarCategories } from './sidebar-categories'
import { SidebarSort } from './sidebar-sort'
import type { Theme } from '../../utils/theme'

export type AppView = 'dashboard' | 'licenses' | 'categories' | 'settings'

type NavItem = {
  id: AppView
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'licenses', label: 'Лицензии' },
  { id: 'settings', label: 'Настройки' },
]

type AppLayoutProps = {
  children: ReactNode
  topBanner?: ReactNode
  initialTheme: Theme
  activeView: AppView
  attentionCount: number
  onNavigate: (view: AppView) => void
  onOpenLicense: (license: License) => void
}

export function AppLayout({
  children,
  topBanner,
  initialTheme,
  activeView,
  attentionCount,
  onNavigate,
  onOpenLicense,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-surface-elevated/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
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

      {topBanner}

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:flex-row sm:px-6">
        <aside
          aria-label="Боковое меню"
          className="w-full shrink-0 sm:w-52"
        >
          <nav aria-label="Основная навигация">
            <ul className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
              {NAV_ITEMS.map((item) => {
                const isActive = activeView === item.id
                const showAttentionBadge =
                  item.id === 'dashboard' && attentionCount > 0
                return (
                  <li key={item.id} className="shrink-0 sm:shrink">
                    <button
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors duration-theme sm:w-full ${
                        isActive
                          ? 'bg-accent/10 font-medium text-accent'
                          : 'text-gray-600 hover:bg-surface-elevated hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      {showAttentionBadge ? (
                        <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                          {attentionCount}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <SidebarAttention
            onNavigate={onNavigate}
            onOpenLicense={onOpenLicense}
          />
          <SidebarCategories onNavigate={onNavigate} />
          <SidebarSort />
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <AppFooter />
    </div>
  )
}
