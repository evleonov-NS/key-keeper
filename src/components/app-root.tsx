import { useEffect, useState } from 'react'
import { AppLayout } from './layout/app-layout'
import { DemoPanel } from './demo/demo-panel'
import { SetupPassword } from './auth/setup-password'
import { LoginPassword } from './auth/login-password'
import { ChangePasswordModal } from './auth/change-password-modal'
import { AuthLayout } from './auth/auth-layout'
import { useAuthStore } from '../store/auth-store'
import { useAutoLock } from '../hooks/use-auto-lock'
import type { Theme } from '../utils/theme'

type AppRootProps = {
  initialTheme: Theme
}

function UnlockedApp({ initialTheme }: AppRootProps) {
  useAutoLock()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  return (
    <>
      <AppLayout initialTheme={initialTheme}>
        <DemoPanel onChangePassword={() => setChangePasswordOpen(true)} />
      </AppLayout>
      {changePasswordOpen ? (
        <ChangePasswordModal onClose={() => setChangePasswordOpen(false)} />
      ) : null}
    </>
  )
}

export function AppRoot({ initialTheme }: AppRootProps) {
  const phase = useAuthStore((state) => state.phase)
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    void initialize()
  }, [initialize])

  if (phase === 'checking') {
    return (
      <AuthLayout title="key-keeper" subtitle="Проверка хранилища…">
        <p className="text-center text-sm text-muted">Загрузка</p>
      </AuthLayout>
    )
  }

  if (phase === 'setup') {
    return <SetupPassword />
  }

  if (phase === 'locked') {
    return <LoginPassword />
  }

  return <UnlockedApp initialTheme={initialTheme} />
}
