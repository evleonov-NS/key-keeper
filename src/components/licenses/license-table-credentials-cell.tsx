import { useState, type MouseEvent } from 'react'
import { Check } from 'lucide-react'
import type { License } from '../../types/license'
import type { SearchHighlight } from '../../utils/search'
import { copyWithAutoClear } from '../../utils/clipboard'
import { HighlightText } from '../ui/highlight-text'

type LicenseTableCredentialsCellProps = {
  license: License
  highlight?: SearchHighlight | null
}

const LOGIN_IDLE =
  'border-violet-200/80 bg-violet-50/50 text-violet-900 hover:border-violet-300 hover:bg-violet-50 dark:border-violet-800/60 dark:bg-violet-950/25 dark:text-violet-200 dark:hover:border-violet-700'

const KEY_IDLE =
  'border-amber-200/80 bg-amber-50/40 text-amber-950 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-100 dark:hover:border-amber-700'

const COPIED =
  'border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950/40 dark:text-green-300'

export function LicenseTableCredentialsCell({
  license,
  highlight,
}: LicenseTableCredentialsCellProps) {
  const [loginCopied, setLoginCopied] = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)

  const handleCopyLogin = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!license.accountLogin) {
      return
    }
    await copyWithAutoClear(license.accountLogin)
    setLoginCopied(true)
    window.setTimeout(() => setLoginCopied(false), 2000)
  }

  const handleCopyKey = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!license.licenseKey) {
      return
    }
    await copyWithAutoClear(license.licenseKey)
    setKeyCopied(true)
    window.setTimeout(() => setKeyCopied(false), 2000)
  }

  const sizeClass =
    'max-w-full px-1.5 py-0.5 text-[10px] xl:px-2 xl:py-1 xl:text-xs'

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-0.5 overflow-hidden">
      {license.accountLogin ? (
        <button
          type="button"
          onClick={(event) => void handleCopyLogin(event)}
          aria-label={`Скопировать логин «${license.name}»`}
          title="Скопировать логин"
          className={`inline-flex max-w-full items-center gap-1 rounded-md border text-left transition-all duration-theme ${sizeClass} ${
            loginCopied ? COPIED : LOGIN_IDLE
          }`}
        >
          {loginCopied ? (
            <>
              <Check size={12} className="shrink-0" />
              <span>Скопирован</span>
            </>
          ) : highlight?.field === 'accountLogin' ? (
            <HighlightText
              text={license.accountLogin}
              start={highlight.start}
              end={highlight.end}
              className="truncate"
            />
          ) : (
            <span className="truncate">{license.accountLogin}</span>
          )}
        </button>
      ) : null}

      <button
        type="button"
        onClick={(event) => void handleCopyKey(event)}
        aria-label={`Скопировать ключ «${license.name}»`}
        title="Скопировать ключ"
        className={`inline-flex max-w-full items-center gap-1 rounded-md border text-left font-mono tracking-wider transition-all duration-theme ${sizeClass} ${
          keyCopied ? COPIED : KEY_IDLE
        }`}
      >
        {keyCopied ? (
          <>
            <Check size={12} className="shrink-0" />
            <span>Скопирован</span>
          </>
        ) : (
          <span>••••••••</span>
        )}
      </button>
    </div>
  )
}
