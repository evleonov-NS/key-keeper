import { useMemo, useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useCategoryStore } from '../../store/category-store'
import { useLicenseStore } from '../../store/license-store'
import { validateCategoryName } from '../../utils/category-validation'

type LicenseCategoryFieldProps = {
  value: string | null
  onChange: (categoryId: string | null) => void
}

const inputClass =
  'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/20'

function licenseCountForCategory(categoryId: string, licenses: { category: string | null }[]): number {
  return licenses.filter((license) => license.category === categoryId).length
}

export function LicenseCategoryField({ value, onChange }: LicenseCategoryFieldProps) {
  const categories = useCategoryStore((state) => state.categories)
  const addCategory = useCategoryStore((state) => state.addCategory)
  const updateCategory = useCategoryStore((state) => state.updateCategory)
  const removeCategory = useCategoryStore((state) => state.removeCategory)
  const licenses = useLicenseStore((state) => state.licenses)

  const [mode, setMode] = useState<'idle' | 'add' | 'edit'>('idle')
  const [draftName, setDraftName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((left, right) =>
        left.name.localeCompare(right.name, 'ru'),
      ),
    [categories],
  )

  const resetDraft = () => {
    setMode('idle')
    setDraftName('')
    setError(null)
  }

  const submitAdd = () => {
    const validationError = validateCategoryName(categories, draftName)
    if (validationError) {
      setError(validationError)
      return
    }

    const created = addCategory(draftName.trim())
    onChange(created.id)
    resetDraft()
  }

  const submitRename = () => {
    if (!value) {
      return
    }

    const validationError = validateCategoryName(categories, draftName, value)
    if (validationError) {
      setError(validationError)
      return
    }

    updateCategory(value, draftName.trim())
    resetDraft()
  }

  const handleDelete = () => {
    if (!value) {
      return
    }

    const category = categories.find((item) => item.id === value)
    if (!category) {
      return
    }

    const count = licenseCountForCategory(value, licenses)
    const licensesNote =
      count > 0
        ? ` У ${count} ${count === 1 ? 'лицензии' : 'лицензий'} поле категории будет очищено.`
        : ''

    if (window.confirm(`Удалить категорию «${category.name}»?${licensesNote}`)) {
      removeCategory(value)
      onChange(null)
      resetDraft()
    }
  }

  const startEdit = () => {
    if (!value) {
      return
    }
    const category = categories.find((item) => item.id === value)
    if (!category) {
      return
    }
    setMode('edit')
    setDraftName(category.name)
    setError(null)
  }

  const submitDraft = () => {
    if (mode === 'add') {
      submitAdd()
      return
    }
    submitRename()
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">Категория</span>

      {mode === 'idle' ? (
        <div className="flex gap-2">
          <select
            id="license-category"
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value || null)}
            className={`${inputClass} min-w-0 flex-1`}
          >
            <option value="">Без категории</option>
            {sortedCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setMode('add')
              setDraftName('')
              setError(null)
            }}
            aria-label="Добавить категорию"
            title="Добавить категорию"
            className="shrink-0 rounded-xl border border-border px-3 py-2.5 text-muted hover:bg-surface"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            onClick={startEdit}
            disabled={!value}
            aria-label="Переименовать категорию"
            title="Переименовать"
            className="shrink-0 rounded-xl border border-border px-3 py-2.5 text-muted hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!value}
            aria-label="Удалить категорию"
            title="Удалить"
            className="shrink-0 rounded-xl border border-border px-3 py-2.5 text-muted hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
          <input
            type="text"
            value={draftName}
            onChange={(event) => {
              setDraftName(event.target.value)
              setError(null)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                submitDraft()
              }
            }}
            placeholder={mode === 'add' ? 'Название новой категории' : 'Новое название'}
            autoFocus
            className={inputClass}
          />
          {error ? (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submitDraft}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              <Check size={14} />
              {mode === 'add' ? 'Добавить' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={resetDraft}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-surface-elevated"
            >
              <X size={14} />
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
