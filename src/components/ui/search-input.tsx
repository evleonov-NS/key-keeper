import { Search, X } from 'lucide-react'
import { MIN_SEARCH_LENGTH } from '../../utils/search'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Компактный вид для бокового меню */
  compact?: boolean
  /** Подсказка под полем (в тулбаре выносится отдельно) */
  showHint?: boolean
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Поиск…',
  compact = false,
  showHint = true,
}: SearchInputProps) {
  return (
    <div>
      <div
        className={`grid w-full items-center rounded-xl border border-border bg-surface transition-shadow focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 ${
          compact ? 'text-xs' : 'text-sm'
        }`}
      >
        <Search
          size={compact ? 14 : 16}
          className="pointer-events-none col-start-1 row-start-1 ml-2.5 text-muted"
        />
        <input
          type="text"
          enterKeyHint="search"
          role="searchbox"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`search-input col-start-1 row-start-1 w-full border-0 bg-transparent outline-none ring-0 focus:ring-0 ${
            compact ? 'py-2 pl-8 pr-8' : 'py-2.5 pl-9 pr-9'
          }`}
          aria-label="Поиск лицензий"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Очистить поиск"
            className="col-start-1 row-start-1 mr-2 justify-self-end rounded-md p-1 text-muted transition-colors hover:bg-surface-elevated hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={compact ? 14 : 16} strokeWidth={2} />
          </button>
        ) : null}
      </div>
      {showHint ? (
        <p
          className={`mt-1.5 text-muted ${compact ? 'text-[10px] leading-snug' : 'text-xs'}`}
        >
          от {MIN_SEARCH_LENGTH} символов · RU/EN · платформа · категории · теги
        </p>
      ) : null}
    </div>
  )
}
