import { SearchInput } from '../ui/search-input'
import { useSearchStore } from '../../store/search-store'

export function SidebarSearch() {
  const query = useSearchStore((state) => state.query)
  const setQuery = useSearchStore((state) => state.setQuery)

  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wide text-muted">
        Поиск
      </p>
      <SearchInput
        compact
        value={query}
        onChange={setQuery}
        placeholder="Название, ключ…"
      />
    </div>
  )
}
