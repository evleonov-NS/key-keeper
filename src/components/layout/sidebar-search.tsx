import { SearchInput } from '../ui/search-input'
import { useLicenseFilterStore } from '../../store/license-filter-store'

export function SidebarSearch() {
  const query = useLicenseFilterStore((state) => state.query)
  const setQuery = useLicenseFilterStore((state) => state.setQuery)

  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wide text-muted">
        Поиск
      </p>
      <SearchInput
        compact
        value={query}
        onChange={setQuery}
        placeholder="Название, тег, категория…"
      />
    </div>
  )
}
