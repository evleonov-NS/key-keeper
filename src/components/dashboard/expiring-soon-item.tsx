import { useState, type MouseEvent } from 'react'
import { Check, ExternalLink, KeyRound, UserRound } from 'lucide-react'
import type { License } from '../../types/license'
import { PLATFORM_LABELS } from '../../types/platform'
import { copyWithAutoClear } from '../../utils/clipboard'
import { getLicenseExpiryInfo } from '../../utils/dates'
import { LicenseExpiryHint } from '../licenses/license-expiry-hint'
import { StatusBadge } from '../licenses/status-badge'

type ExpiringSoonItemProps = {
  license: License
  animationDelayMs: number
  onOpen: (license: License) => void
}

export function ExpiringSoonItem({
  license,
  animationDelayMs,
  onOpen,
}: ExpiringSoonItemProps) {
  const [copiedField, setCopiedField] = useState<'key' | 'login' | null>(null)
  const info = getLicenseExpiryInfo(license)

  const handleCopy = async (
    event: MouseEvent<HTMLButtonElement>,
    field: 'key' | 'login',
    value: string,
  ) => {
    event.stopPropagation()
    await copyWithAutoClear(value)
    setCopiedField(field)
    window.setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <article
      className="fade-in-stagger rounded-xl border border-border bg-surface p-4 transition-colors duration-theme hover:bg-surface-elevated/60"
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{license.name}</h3>
            <StatusBadge status={license.status} />
          </div>
          <p className="mt-1 text-xs text-accent">
            {PLATFORM_LABELS[license.platform]}
            {info.formattedDate ? (
              <span className="text-muted"> · до {info.formattedDate}</span>
            ) : null}
          </p>
          <div className="mt-2">
            <LicenseExpiryHint license={license} compact />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onOpen(license)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted transition-colors duration-theme hover:border-accent/40 hover:text-accent"
          >
            <ExternalLink size={14} />
            Открыть
          </button>
          {license.accountLogin ? (
            <button
              type="button"
              onClick={(event) =>
                void handleCopy(event, 'login', license.accountLogin)
              }
              aria-label={`Копировать логин «${license.name}»`}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors duration-theme ${
                copiedField === 'login'
                  ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                  : 'border-border text-muted hover:border-violet-300 hover:text-violet-700 dark:hover:text-violet-300'
              }`}
            >
              {copiedField === 'login' ? <Check size={14} /> : <UserRound size={14} />}
              Логин
            </button>
          ) : null}
          <button
            type="button"
            onClick={(event) => void handleCopy(event, 'key', license.licenseKey)}
            aria-label={`Копировать ключ «${license.name}»`}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors duration-theme ${
              copiedField === 'key'
                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                : 'border-border text-muted hover:border-amber-300 hover:text-amber-700 dark:hover:text-amber-300'
            }`}
          >
            {copiedField === 'key' ? <Check size={14} /> : <KeyRound size={14} />}
            Ключ
          </button>
        </div>
      </div>
    </article>
  )
}
