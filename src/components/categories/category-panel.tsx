import { useMemo, useState, type FormEvent } from 'react'
import { Check, FolderOpen, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useCategoryStore } from '../../store/category-store'
import { useLicenseStore } from '../../store/license-store'
import { validateCategoryName } from '../../utils/category-validation'

const inputClass =
  'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/20'

function licenseCountForCategory(categoryId: string, licenses: { category: string | null }[]): number {
  return licenses.filter((license) => license.category === categoryId).length
}

export function CategoryPanel() {
  const categories = useCategoryStore((state) => state.categories)
  const addCategory = useCategoryStore((state) => state.addCategory)
  const updateCategory = useCategoryStore((state) => state.updateCategory)
  const removeCategory = useCategoryStore((state) => state.removeCategory)
  const licenses = useLicenseStore((state) => state.licenses)

  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState<string | null>(null)

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((left, right) =>
        left.name.localeCompare(right.name, 'ru'),
      ),
    [categories],
  )

  const handleAdd = (event: FormEvent) => {
    event.preventDefault()
    const error = validateCategoryName(categories, newName)
    if (error) {
      setAddError(error)
      return
    }

    addCategory(newName.trim())
    setNewName('')
    setAddError(null)
  }

  const startEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
    setEditError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditError(null)
  }

  const saveEdit = (id: string) => {
    const error = validateCategoryName(categories, editName, id)
    if (error) {
      setEditError(error)
      return
    }

    updateCategory(id, editName.trim())
    cancelEdit()
  }

  const handleDelete = (id: string, name: string) => {
    const count = licenseCountForCategory(id, licenses)
    const licensesNote =
      count > 0
        ? ` У ${count} ${count === 1 ? 'лицензии' : 'лицензий'} поле категории будет очищено.`
        : ''

    if (window.confirm(`Удалить категорию «${name}»?${licensesNote}`)) {
      removeCategory(id)
      if (editingId === id) {
        cancelEdit()
      }
    }
  }

  return (
    <div className="space-y-6">
      <section className="fade-in rounded-card border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
        <div className="flex items-center gap-2">
          <FolderOpen size={20} className="text-accent" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Категории</h1>
            <p className="mt-1 text-sm text-muted">
              Справочник для группировки лицензий. При удалении категории записи
              не удаляются — становятся «без категории».
            </p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <label htmlFor="new-category" className="sr-only">
              Новая категория
            </label>
            <input
              id="new-category"
              type="text"
              value={newName}
              onChange={(event) => {
                setNewName(event.target.value)
                setAddError(null)
              }}
              placeholder="Название новой категории"
              className={inputClass}
            />
            {addError ? (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{addError}</p>
            ) : null}
          </div>
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            <Plus size={16} />
            Добавить
          </button>
        </form>
      </section>

      <section className="rounded-card border border-border bg-surface-elevated p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">
          Список ({sortedCategories.length})
        </h2>

        {sortedCategories.length === 0 ? (
          <p className="text-sm text-muted">
            Категорий пока нет. Добавьте первую в форме выше или загрузите демо-данные
            на странице «Лицензии».
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {sortedCategories.map((category) => {
              const linkedCount = licenseCountForCategory(category.id, licenses)
              const isEditing = editingId === category.id

              return (
                <li
                  key={category.id}
                  className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  {isEditing ? (
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={editName}
                        onChange={(event) => {
                          setEditName(event.target.value)
                          setEditError(null)
                        }}
                        autoFocus
                        className={inputClass}
                        aria-label="Новое название категории"
                      />
                      {editError ? (
                        <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{category.name}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {linkedCount === 0
                          ? 'Нет привязанных лицензий'
                          : `${linkedCount} ${linkedCount === 1 ? 'лицензия' : linkedCount < 5 ? 'лицензии' : 'лицензий'}`}
                        {category.isDemo ? ' · demo' : ''}
                      </p>
                    </div>
                  )}

                  <div className="flex shrink-0 gap-1 self-end sm:self-center">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(category.id)}
                          aria-label="Сохранить"
                          className="rounded-md p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          aria-label="Отмена"
                          className="rounded-md p-2 text-muted hover:bg-surface"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(category.id, category.name)}
                          aria-label="Переименовать"
                          className="rounded-md p-2 text-muted hover:bg-surface-elevated hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category.id, category.name)}
                          aria-label="Удалить"
                          className="rounded-md p-2 text-muted hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
