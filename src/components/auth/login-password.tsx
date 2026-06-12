import { useState } from 'react'
import { useAuthStore } from '../../store/auth-store'
import { AuthLayout } from './auth-layout'
import { PasswordField } from './password-field'

export function LoginPassword() {
  const [password, setPassword] = useState('')
  const login = useAuthStore((state) => state.login)
  const authError = useAuthStore((state) => state.authError)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!password) {
      return
    }
    await login(password)
    setPassword('')
  }

  return (
    <AuthLayout
      title="Разблокировка"
      subtitle="Введите мастер-пароль для доступа к ключам"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <PasswordField
          id="login-password"
          label="Мастер-пароль"
          value={password}
          onChange={setPassword}
        />

        {authError ? (
          <p className="text-xs text-red-600 dark:text-red-400">{authError}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !password}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Проверка…' : 'Разблокировать'}
        </button>
      </form>
    </AuthLayout>
  )
}
