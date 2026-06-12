import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { type Theme, toggleTheme } from '../../utils/theme'

type ThemeToggleProps = {
  initialTheme: Theme
}

export function ThemeToggle({ initialTheme }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  const handleToggle = () => {
    setTheme((current) => toggleTheme(current))
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-elevated text-gray-700 shadow-sm transition-all duration-theme hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}
