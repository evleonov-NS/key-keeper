const THEME_STORAGE_KEY = 'key-keeper-theme'

export type Theme = 'light' | 'dark'

export function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return null
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function initTheme(): Theme {
  const stored = getStoredTheme() ?? 'light'
  applyTheme(stored)
  return stored
}

export function toggleTheme(current: Theme): Theme {
  const next: Theme = current === 'light' ? 'dark' : 'light'
  applyTheme(next)
  return next
}
