import { useState } from 'react'
import type { License } from '../../types/license'
import { PLATFORM_LABELS, type Platform } from '../../types/platform'
import {
  createEmptyLicenseForm,
  licenseToFormValues,
  type LicenseFormValues,
} from '../../utils/license-validation'
import { LicenseKeyField } from './license-key-field'
import { LicensePhotoField } from './license-photo-field'
import { LicenseCategoryField } from './license-category-field'
import { ShortDateInput } from '../ui/short-date-input'

type LicenseFormProps = {
  initialLicense?: License
  formError: string | null
  duplicateWarning: string | null
  isSubmitting: boolean
  onSubmit: (
    values: LicenseFormValues,
    images: Blob[],
    options?: { closeAfterSave?: boolean },
  ) => void
  onCancel: () => void
  onArchive?: () => void
  onRestore?: () => void
  onDeletePermanent?: () => void
}

const inputClass =
  'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/20'

export function LicenseForm({
  initialLicense,
  formError,
  duplicateWarning,
  isSubmitting,
  onSubmit,
  onCancel,
  onArchive,
  onRestore,
  onDeletePermanent,
}: LicenseFormProps) {
  const [values, setValues] = useState<LicenseFormValues>(
    initialLicense ? licenseToFormValues(initialLicense) : createEmptyLicenseForm(),
  )
  const [images, setImages] = useState<Blob[]>(initialLicense?.images ?? [])

  const setField = <K extends keyof LicenseFormValues>(
    field: K,
    value: LicenseFormValues[K],
  ) => {
    setValues((current) => {
      const next = { ...current, [field]: value }
      if (field === 'isPerpetual' && value === true) {
        next.expiryDate = ''
      }
      return next
    })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSubmit(values, images, { closeAfterSave: true })
  }

  const saveWithoutClose = () => {
    onSubmit(values, images, {
      closeAfterSave: !initialLicense,
    })
  }

  const handleFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') {
      return
    }

    const target = event.target as HTMLElement
    if (target.id === 'license-tags') {
      event.preventDefault()
      saveWithoutClose()
      return
    }

    if (target.tagName === 'TEXTAREA') {
      return
    }

    if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
      event.preventDefault()
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
      <div>
        <label htmlFor="license-name" className="mb-1.5 block text-sm font-medium">
          Название *
        </label>
        <input
          id="license-name"
          type="text"
          value={values.name}
          onChange={(event) => setField('name', event.target.value)}
          className={inputClass}
        />
      </div>

      <LicenseKeyField
        value={values.licenseKey}
        onChange={(licenseKey) => setField('licenseKey', licenseKey)}
      />

      <LicenseKeyField
        id="account-login"
        label="Логин"
        optional
        masked={false}
        copyAriaLabel="Копировать логин"
        value={values.accountLogin}
        onChange={(accountLogin) => setField('accountLogin', accountLogin)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="license-platform" className="mb-1.5 block text-sm font-medium">
            Платформа
          </label>
          <select
            id="license-platform"
            value={values.platform}
            onChange={(event) => setField('platform', event.target.value as Platform)}
            className={inputClass}
          >
            {(Object.keys(PLATFORM_LABELS) as Platform[]).map((platform) => (
              <option key={platform} value={platform}>
                {PLATFORM_LABELS[platform]}
              </option>
            ))}
          </select>
        </div>

        <LicenseCategoryField
          value={values.category}
          onChange={(category) => setField('category', category)}
        />
      </div>

      <div>
        <label htmlFor="activation-url" className="mb-1.5 block text-sm font-medium">
          Ссылка активации
        </label>
        <input
          id="activation-url"
          type="url"
          value={values.activationUrl}
          onChange={(event) => setField('activationUrl', event.target.value)}
          placeholder="https://"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="purchase-url" className="mb-1.5 block text-sm font-medium">
          Где куплено
        </label>
        <input
          id="purchase-url"
          type="text"
          value={values.purchaseUrl}
          onChange={(event) => setField('purchaseUrl', event.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="linked-email" className="mb-1.5 block text-sm font-medium">
          Почта привязки <span className="font-normal text-muted">(необяз.)</span>
        </label>
        <input
          id="linked-email"
          type="text"
          inputMode="email"
          value={values.linkedEmail}
          onChange={(event) => setField('linkedEmail', event.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ShortDateInput
          id="purchase-date"
          label="Дата покупки"
          value={values.purchaseDate}
          nextFieldId="expiry-date"
          onChange={(purchaseDate) => setField('purchaseDate', purchaseDate)}
        />

        <ShortDateInput
          id="expiry-date"
          label="Дата окончания"
          value={values.expiryDate}
          disabled={values.isPerpetual}
          nextFieldId="license-tags"
          onChange={(expiryDate) => setField('expiryDate', expiryDate)}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isPerpetual}
            onChange={(event) => setField('isPerpetual', event.target.checked)}
            className="rounded border-border"
          />
          Бессрочная
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.remind}
            onChange={(event) => setField('remind', event.target.checked)}
            className="rounded border-border"
          />
          Напоминать
        </label>
      </div>

      <div>
        <label htmlFor="license-tags" className="mb-1.5 block text-sm font-medium">
          Теги
        </label>
        <input
          id="license-tags"
          type="text"
          value={values.tagsText}
          onChange={(event) => setField('tagsText', event.target.value)}
          placeholder="офис, подписка"
          className={inputClass}
        />
        {initialLicense ? (
          <p className="mt-1 text-xs text-muted">Enter — сохранить без закрытия</p>
        ) : null}
      </div>

      <LicensePhotoField images={images} onChange={setImages} />

      <div>
        <label htmlFor="license-comment" className="mb-1.5 block text-sm font-medium">
          Комментарий
        </label>
        <textarea
          id="license-comment"
          value={values.comment}
          onChange={(event) => setField('comment', event.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>

      {formError ? (
        <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
      ) : null}
      {duplicateWarning ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          {duplicateWarning}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          id="license-form-submit"
          disabled={isSubmitting}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {isSubmitting ? 'Сохранение…' : initialLicense ? 'Сохранить' : 'Добавить'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface"
        >
          Отмена
        </button>

        {initialLicense && onRestore && initialLicense.status === 'archived' ? (
          <button
            type="button"
            onClick={onRestore}
            className="ml-auto rounded-xl border border-green-200 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-50 dark:border-green-900/50 dark:text-green-300 dark:hover:bg-green-950/30"
          >
            Восстановить
          </button>
        ) : null}

        {initialLicense && onArchive && initialLicense.status !== 'archived' ? (
          <button
            type="button"
            onClick={onArchive}
            className="ml-auto rounded-xl border border-amber-200 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-950/30"
          >
            В архив
          </button>
        ) : null}

        {initialLicense && onDeletePermanent ? (
          <button
            type="button"
            onClick={onDeletePermanent}
            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/30"
          >
            Удалить навсегда
          </button>
        ) : null}
      </div>
    </form>
  )
}
