import { useState } from 'react'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import { copyWithAutoClear } from '../../utils/clipboard'

type LicenseKeyFieldProps = {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  id?: string
  label?: string
  optional?: boolean
  copyAriaLabel?: string
  /** Маскировать значение (пароль + глаз). Для логина — false. */
  masked?: boolean
}

export function LicenseKeyField({
  value,
  onChange,
  readOnly = false,
  id = 'license-key',
  label = 'Ключ лицензии',
  optional = false,
  copyAriaLabel = 'Копировать ключ',
  masked = true,
}: LicenseKeyFieldProps) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!value) {
      return
    }
    await copyWithAutoClear(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {optional ? (
          <span className="font-normal text-muted"> (необяз.)</span>
        ) : null}
      </label>
      <div className="relative">
        <input
          id={id}
          type={masked ? (visible ? 'text' : 'password') : 'text'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          autoComplete="off"
          className={`w-full rounded-xl border border-border bg-surface py-2.5 pl-3 font-mono text-sm outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/20 ${
            masked ? 'pr-20' : 'pr-10'
          }`}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
          {masked ? (
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              aria-label={visible ? 'Скрыть ключ' : 'Показать ключ'}
              className="rounded-md p-1.5 text-muted hover:bg-surface-elevated hover:text-gray-700 dark:hover:text-gray-200"
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handleCopy()}
            disabled={!value}
            aria-label={copyAriaLabel}
            className="rounded-md p-1.5 text-muted hover:bg-surface-elevated hover:text-gray-700 disabled:opacity-40 dark:hover:text-gray-200"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted">
        Буфер очистится через 120 сек после копирования
      </p>
    </div>
  )
}
