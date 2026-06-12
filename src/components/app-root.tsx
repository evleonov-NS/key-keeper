import { useEffect, useState } from 'react'
import { AppLayout, type AppView } from './layout/app-layout'
import { CategoryPanel } from './categories/category-panel'
import { DemoPanel } from './demo/demo-panel'
import { SettingsPanel } from './settings/settings-panel'
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

function ViewPlaceholder({ title, stage }: { title: string; stage: string }) {
  return (
    <section className="fade-in rounded-card border border-border bg-surface-elevated p-8 shadow-card">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted">Раздел в разработке — {stage}.</p>
    </section>
  )
}

function UnlockedApp({ initialTheme }: AppRootProps) {
  useAutoLock()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [activeView, setActiveView] = useState<AppView>('licenses')

  return (
    <>
      <AppLayout
        initialTheme={initialTheme}
        activeView={activeView}
        onNavigate={setActiveView}
      >
        {activeView === 'licenses' ? <DemoPanel /> : null}
        {activeView === 'categories' ? <CategoryPanel /> : null}
        {activeView === 'dashboard' ? (
          <ViewPlaceholder title="Дашборд" stage="этап 8" />
        ) : null}
        {activeView === 'settings' ? (
          <SettingsPanel onChangePassword={() => setChangePasswordOpen(true)} />
        ) : null}
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
