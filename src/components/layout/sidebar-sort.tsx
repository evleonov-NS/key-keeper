import { ArrowDownAZ } from 'lucide-react'
import { useAppStore } from '../../store/app-store'
import { useLicenseFilterStore } from '../../store/license-filter-store'
import {
  SORT_FIELD_LABELS,
  type LicenseSortField,
} from '../../utils/sort-licenses'

export function SidebarSort() {
  const sidebarSortEnabled = useAppStore(
    (state) => state.settings.sidebarSortEnabled,
  )
  const sortBy = useLicenseFilterStore((state) => state.sortBy)
  const setSortBy = useLicenseFilterStore((state) => state.setSortBy)

  if (!sidebarSortEnabled) {
    return null
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="mb-2 flex items-center gap-1.5 px-1 text-[10px] font-medium uppercase tracking-wide text-muted">
        <ArrowDownAZ size={12} />
        Сортировка
      </p>
      <select
        value={sortBy}
        onChange={(event) => setSortBy(event.target.value as LicenseSortField)}
        aria-label="Сортировка лицензий"
        className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        {(Object.keys(SORT_FIELD_LABELS) as LicenseSortField[]).map((field) => (
          <option key={field} value={field}>
            {SORT_FIELD_LABELS[field]}
          </option>
        ))}
      </select>
    </div>
  )
}
