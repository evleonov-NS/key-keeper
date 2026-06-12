import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { MIN_MASTER_PASSWORD_LENGTH } from '../../crypto/constants'
import { useAuthStore } from '../../store/auth-store'
import { AuthLayout } from './auth-layout'
import { PasswordField } from './password-field'

export function SetupPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const setupMasterPassword = useAuthStore((state) => state.setupMasterPassword)
  const authError = useAuthStore((state) => state.authError)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (password.length < MIN_MASTER_PASSWORD_LENGTH) {
      return
    }
    if (password !== confirm) {
      return
    }

    await setupMasterPassword(password)
    setPassword('')
    setConfirm('')
  }

  const mismatch = confirm.length > 0 && password !== confirm
  const tooShort =
    password.length > 0 && password.length < MIN_MASTER_PASSWORD_LENGTH

  return (
    <AuthLayout
      title="Создание хранилища"
      subtitle="Задайте мастер-пароль для шифрования всех данных"
    >
      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
        <div className="flex gap-3">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />
          <div className="text-sm leading-relaxed text-amber-900 dark:text-amber-100">
            <p className="font-medium">Восстановление пароля невозможно</p>
            <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
              Забыли пароль — данные потеряны навсегда. Регулярно делайте
              зашифрованный бэкап <code className="text-xs">.vault</code>.
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <PasswordField
          id="setup-password"
          label="Мастер-пароль"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <PasswordField
          id="setup-confirm"
          label="Подтверждение пароля"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        {tooShort ? (
          <p className="text-xs text-red-600 dark:text-red-400">
            Минимум {MIN_MASTER_PASSWORD_LENGTH} символов
          </p>
        ) : null}
        {mismatch ? (
          <p className="text-xs text-red-600 dark:text-red-400">
            Пароли не совпадают
          </p>
        ) : null}
        {authError ? (
          <p className="text-xs text-red-600 dark:text-red-400">{authError}</p>
        ) : null}

        <button
          type="submit"
          disabled={
            isSubmitting ||
            password.length < MIN_MASTER_PASSWORD_LENGTH ||
            password !== confirm
          }
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Создание…' : 'Создать хранилище'}
        </button>
      </form>
    </AuthLayout>
  )
}
