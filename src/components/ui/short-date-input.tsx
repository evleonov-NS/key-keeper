import { useEffect, useRef, useState } from 'react'
import { Calendar } from 'lucide-react'
import {
  formatDigitsAsShortDate,
  formatShortDate,
  parseShortDateInput,
} from '../../utils/dates'

type ShortDateInputProps = {
  id: string
  label: string
  value: string
  disabled?: boolean
  nextFieldId?: string
  onChange: (isoValue: string) => void
}

const inputClass =
  'min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/20'

export function ShortDateInput({
  id,
  label,
  value,
  disabled = false,
  nextFieldId,
  onChange,
}: ShortDateInputProps) {
  const [text, setText] = useState(() => (value ? formatShortDate(value) : ''))
  const [error, setError] = useState<string | null>(null)
  const pickerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setText(value ? formatShortDate(value) : '')
    setError(null)
  }, [value])

  const commitText = (nextText: string): boolean => {
    const trimmed = nextText.trim()
    if (!trimmed) {
      setError(null)
      onChange('')
      return true
    }

    const iso = parseShortDateInput(trimmed)
    if (!iso) {
      setError('Формат: дд.мм.гг')
      return false
    }

    setError(null)
    setText(formatShortDate(iso))
    onChange(iso)
    return true
  }

  const handleTextChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 6)
    const formatted = formatDigitsAsShortDate(digits)
    setText(formatted)
    setError(null)

    if (digits.length === 6) {
      const iso = parseShortDateInput(formatted)
      if (iso) {
        onChange(iso)
      }
    } else if (!digits) {
      onChange('')
    }
  }

  const focusNext = () => {
    if (!nextFieldId) {
      return
    }
    document.getElementById(nextFieldId)?.focus()
  }

  const openPicker = () => {
    if (disabled) {
      return
    }
    const picker = pickerRef.current
    if (!picker) {
      return
    }
    try {
      picker.showPicker()
    } catch {
      picker.click()
    }
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={text}
          disabled={disabled}
          placeholder="дд.мм.гг"
          maxLength={8}
          onChange={(event) => handleTextChange(event.target.value)}
          onBlur={() => {
            commitText(text)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              if (commitText(text)) {
                focusNext()
              }
            }
          }}
          className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={openPicker}
          aria-label={`Выбрать ${label.toLowerCase()} в календаре`}
          className="shrink-0 rounded-xl border border-border px-3 py-2.5 text-muted hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Calendar size={16} />
        </button>
        <input
          ref={pickerRef}
          type="date"
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          value={value}
          disabled={disabled}
          onChange={(event) => {
            const iso = event.target.value
            if (iso) {
              onChange(iso)
              setText(formatShortDate(iso))
              setError(null)
            }
          }}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  )
}
