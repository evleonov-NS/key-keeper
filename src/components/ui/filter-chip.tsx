import { X } from 'lucide-react'

type FilterChipProps = {
  label: string
  onClear: () => void
}

export function FilterChip({ label, onClear }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-accent/25 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label="Сбросить фильтр"
        className="rounded p-0.5 transition-colors hover:bg-accent/15"
      >
        <X size={12} strokeWidth={2.5} />
      </button>
    </span>
  )
}
