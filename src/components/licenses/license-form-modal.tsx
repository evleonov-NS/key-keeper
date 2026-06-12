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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const persistValues = (values: LicenseFormValues) => {
    const payload = toLicensePayload(values, license)
    if (mode === 'create') {
      addLicense(payload)
    } else if (license) {
      updateLicense(license.id, payload)
    }
    onClose()
  }

  const handleSubmit = (values: LicenseFormValues) => {
    const validationError = validateLicenseForm(values)
    if (validationError) {
      setFormError(validationError)
      setDuplicateWarning(null)
      return
    }

    const duplicate = findDuplicateLicense(
      licenses,
      values.licenseKey,
      license?.id,
    )

    if (duplicate) {
      setPendingValues(values)
      setDuplicateWarning(
        `Ключ уже используется в «${duplicate.name}». Сохранить всё равно?`,
      )
      setFormError(null)
      return
    }

    setIsSubmitting(true)
    persistValues(values)
    setIsSubmitting(false)
  }

  const confirmDuplicate = () => {
    if (!pendingValues) {
      return
    }
    setIsSubmitting(true)
    persistValues(pendingValues)
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
      wide
    >
      <LicenseForm
        initialLicense={license}
        formError={formError}
        duplicateWarning={duplicateWarning}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={onClose}
        onArchive={mode === 'edit' ? handleArchive : undefined}
        onRestore={mode === 'edit' ? handleRestore : undefined}
        onDeletePermanent={mode === 'edit' ? handleDeletePermanent : undefined}
      />

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
