import { useState, type MouseEvent } from 'react'
import { Archive, Check, Pencil } from 'lucide-react'
import type { License } from '../../types/license'
import { PLATFORM_LABELS, type Platform } from '../../types/platform'
import type { SearchHighlight } from '../../utils/search'
import { copyWithAutoClear } from '../../utils/clipboard'
import { NO_CATEGORY_FILTER } from '../../store/license-filter-store'
import { useCategoryStore } from '../../store/category-store'
import { HighlightText } from '../ui/highlight-text'
import { StatusBadge } from './status-badge'

type LicenseCardProps = {
  license: License
  highlight?: SearchHighlight | null
  onEdit: (license: License) => void
  onArchive: (license: License) => void
  onCategoryClick: (categoryId: string) => void
  onPlatformClick: (platform: Platform) => void
}

type CopyableFieldButtonProps = {
  value: string
  copied: boolean
  onCopy: (event: MouseEvent<HTMLButtonElement>) => void
  copiedLabel: string
  ariaLabel: string
  variant: 'login' | 'key'
  highlight?: SearchHighlight | null
  highlightField?: SearchHighlight['field']
}

const VARIANT_IDLE: Record<
  CopyableFieldButtonProps['variant'],
  string
> = {
  login:
    'border-violet-200/80 bg-violet-50/50 text-violet-900 hover:border-violet-300 hover:bg-violet-50 dark:border-violet-800/60 dark:bg-violet-950/25 dark:text-violet-200 dark:hover:border-violet-700',
  key:
    'border-amber-200/80 bg-amber-50/40 text-amber-950 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-100 dark:hover:border-amber-700',
}

function CopyableFieldButton({
  value,
  copied,
  onCopy,
  copiedLabel,
  ariaLabel,
  variant,
  highlight = null,
  highlightField,
}: CopyableFieldButtonProps) {
  if (!value) {
    return null
  }

  const isFirst = variant === 'login'

  return (
    <button
      type="button"
      onClick={(event) => void onCopy(event)}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`inline-flex w-full items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-all duration-theme ${
        isFirst ? 'mt-2' : 'mt-1.5'
      } ${
        variant === 'login' ? 'font-medium' : 'font-mono tracking-wider'
      } ${
        copied
          ? 'border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950/40 dark:text-green-300'
          : VARIANT_IDLE[variant]
      }`}
    >
      {copied ? (
        <>
          <Check size={14} className="shrink-0 text-green-600 dark:text-green-400" />
          <span>{copiedLabel}</span>
        </>
      ) : variant === 'key' ? (
        <span className="w-full text-left">
          {highlight?.field === highlightField ? (
            <>
              <mark className="rounded-sm bg-amber-200 px-0.5 dark:bg-amber-500/35">
                ••••
              </mark>
              ••••
            </>
          ) : (
            '••••••••'
          )}
        </span>
      ) : highlight && highlight.field === highlightField ? (
        <HighlightText
          text={value}
          start={highlight.start}
          end={highlight.end}
          className="w-full truncate text-left"
        />
      ) : (
        <span className="w-full truncate text-left">{value}</span>
      )}
    </button>
  )
}

export function LicenseCard({
  license,
  highlight = null,
  onEdit,
  onArchive,
  onCategoryClick,
  onPlatformClick,
}: LicenseCardProps) {
  const [keyCopied, setKeyCopied] = useState(false)
  const [loginCopied, setLoginCopied] = useState(false)
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

  const categoryContent =
    highlight?.field === 'category' ? (
      <HighlightText
        text={categoryName}
        start={highlight.start}
        end={highlight.end}
      />
    ) : (
      categoryName
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

  const handleCopyKey = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!license.licenseKey) {
      return
    }
    await copyWithAutoClear(license.licenseKey)
    setKeyCopied(true)
    setTimeout(() => setKeyCopied(false), 2000)
  }

  const handleCopyLogin = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!license.accountLogin) {
      return
    }
    await copyWithAutoClear(license.accountLogin)
    setLoginCopied(true)
    setTimeout(() => setLoginCopied(false), 2000)
  }

  const handleCategoryClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onCategoryClick(license.category ?? NO_CATEGORY_FILTER)
  }

  const handlePlatformClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onPlatformClick(license.platform)
  }

  return (
    <article className="group rounded-xl border border-border bg-surface px-4 py-3 transition-shadow duration-theme hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onEdit(license)}
            className="w-full text-left"
          >
            <h3 className="font-medium">{nameContent}</h3>
          </button>
          <p className="mt-0.5 text-xs text-muted">
            <button
              type="button"
              onClick={handlePlatformClick}
              className="rounded-sm text-accent underline-offset-2 transition-colors hover:text-accent-hover hover:underline"
            >
              {PLATFORM_LABELS[license.platform]}
            </button>
            {' · '}
            <button
              type="button"
              onClick={handleCategoryClick}
              className="rounded-sm text-accent underline-offset-2 transition-colors hover:text-accent-hover hover:underline"
            >
              {categoryContent}
            </button>
          </p>
        </div>
        <StatusBadge status={license.status} />
      </div>

      <CopyableFieldButton
        value={license.accountLogin}
        copied={loginCopied}
        onCopy={handleCopyLogin}
        copiedLabel="Логин скопирован"
        ariaLabel="Скопировать логин"
        variant="login"
        highlight={highlight}
        highlightField="accountLogin"
      />

      <CopyableFieldButton
        value={license.licenseKey}
        copied={keyCopied}
        onCopy={handleCopyKey}
        copiedLabel="Ключ скопирован"
        ariaLabel="Скопировать ключ"
        variant="key"
        highlight={highlight}
        highlightField="licenseKey"
      />

      {license.comment ? (
        <p className="mt-2 text-xs text-muted">{commentContent}</p>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {license.isDemo ? (
            <span className="inline-flex rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
              demo
            </span>
          ) : null}
        </div>

        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(license)}
            aria-label="Редактировать"
            className="rounded-md p-1.5 text-muted hover:bg-surface-elevated hover:text-gray-700 dark:hover:text-gray-200"
          >
            <Pencil size={14} />
          </button>
          {license.status !== 'archived' ? (
            <button
              type="button"
              onClick={() => onArchive(license)}
              aria-label="В архив"
              className="rounded-md p-1.5 text-muted hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 dark:hover:text-amber-300"
            >
              <Archive size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
