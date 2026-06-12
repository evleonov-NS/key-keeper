import type { License } from '../../types/license'
import { PLATFORM_LABELS } from '../../types/platform'
import type { SearchHighlight } from '../../utils/search'
import { useCategoryStore } from '../../store/category-store'
import { HighlightText } from '../ui/highlight-text'
import { StatusBadge } from './status-badge'

type LicenseCardProps = {
  license: License
  highlight?: SearchHighlight | null
}

export function LicenseCard({ license, highlight = null }: LicenseCardProps) {
  const categories = useCategoryStore((state) => state.categories)
  const categoryName =
    categories.find((category) => category.id === license.category)?.name ??
    'Без категории'

  const nameContent =
    highlight?.field === 'name' ? (
      <HighlightText
        text={license.name}
        start={highlight.start}
        end={highlight.end}
        className="truncate"
      />
    ) : (
      <span className="truncate">{license.name}</span>
    )

  const commentContent =
    license.comment && highlight?.field === 'comment' ? (
      <HighlightText
        text={license.comment}
        start={highlight.start}
        end={highlight.end}
        className="line-clamp-2"
      />
    ) : (
      license.comment
    )

  return (
    <article className="rounded-xl border border-border bg-surface px-4 py-3 transition-shadow duration-theme hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium">{nameContent}</h3>
          <p className="mt-0.5 text-xs text-muted">
            {PLATFORM_LABELS[license.platform]} · {categoryName}
          </p>
        </div>
        <StatusBadge status={license.status} />
      </div>

      <p className="mt-2 font-mono text-sm tracking-wider text-gray-500 dark:text-gray-400">
        {highlight?.field === 'licenseKey' ? (
          <>
            <mark className="rounded-sm bg-amber-200 px-0.5 dark:bg-amber-500/35">
              ••••
            </mark>
            ••••
          </>
        ) : (
          '••••••••'
        )}
      </p>

      {license.comment ? (
        <p className="mt-2 text-xs text-muted">{commentContent}</p>
      ) : null}

      {license.isDemo ? (
        <span className="mt-2 inline-flex rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
          demo
        </span>
      ) : null}
    </article>
  )
}
