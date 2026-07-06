import { useState } from 'react'
import type { License } from '../../types/license'
import { useLicenseStore } from '../../store/license-store'
import {
  findDuplicateLicense,
  toLicensePayload,
  validateLicenseForm,
  type LicenseFormValues,
} from '../../utils/license-validation'
import { Modal } from '../ui/modal'
import { LicenseForm } from './license-form'

type LicenseFormModalProps = {
  mode: 'create' | 'edit'
  license?: License
  onClose: () => void
}

export function LicenseFormModal({
  mode,
  license,
  onClose,
}: LicenseFormModalProps) {
  const licenses = useLicenseStore((state) => state.licenses)
  const addLicense = useLicenseStore((state) => state.addLicense)
  const updateLicense = useLicenseStore((state) => state.updateLicense)
  const archiveLicense = useLicenseStore((state) => state.archiveLicense)
  const removeLicense = useLicenseStore((state) => state.removeLicense)

  const [formError, setFormError] = useState<string | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [pendingValues, setPendingValues] = useState<LicenseFormValues | null>(
    null,
  )
  const [pendingImages, setPendingImages] = useState<Blob[] | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedHint, setSavedHint] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const persistValues = (
    values: LicenseFormValues,
    images: Blob[],
    closeAfterSave = true,
  ) => {
    const payload = toLicensePayload(values, license, images)
    if (mode === 'create') {
      addLicense(payload)
    } else if (license) {
      updateLicense(license.id, payload)
    }
    if (closeAfterSave) {
      onClose()
    }
  }

  const handleSubmit = (
    values: LicenseFormValues,
    images: Blob[],
    options?: { closeAfterSave?: boolean },
  ) => {
    const closeAfterSave = options?.closeAfterSave ?? true
    const validationError = validateLicenseForm(values)
    if (validationError) {
      setFormError(validationError)
      setDuplicateWarning(null)
      setSavedHint(false)
      return
    }

    const duplicate = findDuplicateLicense(
      licenses,
      values.licenseKey,
      license?.id,
    )

    if (duplicate) {
      setPendingValues(values)
      setPendingImages(images)
      setDuplicateWarning(
        `Ключ уже используется в «${duplicate.name}». Сохранить всё равно?`,
      )
      setFormError(null)
      setSavedHint(false)
      return
    }

    setIsSubmitting(true)
    persistValues(values, images, closeAfterSave)
    setIsSubmitting(false)

    if (!closeAfterSave) {
      setFormError(null)
      setDuplicateWarning(null)
      setSavedHint(true)
      window.setTimeout(() => setSavedHint(false), 2000)
    }
  }

  const confirmDuplicate = () => {
    if (!pendingValues || !pendingImages) {
      return
    }
    setIsSubmitting(true)
    persistValues(pendingValues, pendingImages)
    setIsSubmitting(false)
  }

  const handleRestore = () => {
    if (!license) {
      return
    }
    updateLicense(license.id, { status: 'active', remind: true })
    onClose()
  }

  const handleArchive = () => {
    if (!license) {
      return
    }
    if (
      window.confirm(
        `Переместить «${license.name}» в архив? Запись можно восстановить при редактировании.`,
      )
    ) {
      archiveLicense(license.id)
      onClose()
    }
  }

  const handleDeletePermanent = () => {
    if (!license) {
      return
    }
    if (
      window.confirm(
        `Удалить «${license.name}» навсегда? Это действие нельзя отменить.`,
      )
    ) {
      removeLicense(license.id)
      onClose()
    }
  }

  return (
    <Modal
      title={mode === 'create' ? 'Новая лицензия' : 'Редактирование'}
      onClose={onClose}
      dirty={isDirty || duplicateWarning !== null}
      wide
    >
      <LicenseForm
        initialLicense={license}
        formError={formError}
        duplicateWarning={duplicateWarning}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={onClose}
        onDirtyChange={setIsDirty}
        onArchive={mode === 'edit' ? handleArchive : undefined}
        onRestore={mode === 'edit' ? handleRestore : undefined}
        onDeletePermanent={mode === 'edit' ? handleDeletePermanent : undefined}
      />

      {savedHint ? (
        <p className="mt-3 text-sm text-green-700 dark:text-green-300">Сохранено</p>
      ) : null}

      {duplicateWarning ? (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={confirmDuplicate}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          >
            Всё равно сохранить
          </button>
          <button
            type="button"
            onClick={() => {
              setDuplicateWarning(null)
              setPendingValues(null)
              setPendingImages(null)
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
          >
            Изменить ключ
          </button>
        </div>
      ) : null}
    </Modal>
  )
}
