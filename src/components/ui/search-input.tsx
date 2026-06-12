import { Search, X } from 'lucide-react'
import { MIN_SEARCH_LENGTH } from '../../utils/search'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Компактный вид для бокового меню */
  compact?: boolean
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Поиск…',
  compact = false,
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search
        size={compact ? 14 : 16}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="text"
        inputMode="search"
        enterKeyHint="search"
        role="searchbox"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`search-input w-full rounded-xl border border-border bg-surface text-sm outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/20 ${
          compact ? 'py-2 pl-8 pr-8 text-xs' : 'py-2.5 pl-9 pr-9'
        }`}
        aria-label="Поиск лицензий"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Очистить поиск"
          className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-elevated text-muted shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      ) : null}
      <p className={`mt-1.5 text-muted ${compact ? 'text-[10px] leading-snug' : 'text-xs'}`}>
        от {MIN_SEARCH_LENGTH} символов · RU/EN
      </p>
    </div>
  )
}
