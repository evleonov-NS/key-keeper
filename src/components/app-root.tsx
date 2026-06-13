import { useEffect, useState } from 'react'
import { AppLayout, type AppView } from './layout/app-layout'
import { CategoryPanel } from './categories/category-panel'
import { DashboardPanel } from './dashboard/dashboard-panel'
import { DemoPanel } from './demo/demo-panel'
import { SettingsPanel } from './settings/settings-panel'
import { SetupPassword } from './auth/setup-password'
import { LoginPassword } from './auth/login-password'
import { ChangePasswordModal } from './auth/change-password-modal'
import { AuthLayout } from './auth/auth-layout'
import { useAuthStore } from '../store/auth-store'
import { useLicenseStore } from '../store/license-store'
import { useAppStore } from '../store/app-store'
import { useLicenseFilterStore } from '../store/license-filter-store'
import { useAutoLock } from '../hooks/use-auto-lock'
import { useLicenseStatusRefresh } from '../hooks/use-license-status-refresh'
import { useDocumentTitle } from '../hooks/use-document-title'
import { countExpiringLicenses } from '../utils/dashboard'
import type { License } from '../types/license'
import type { LicenseStatus } from '../types/license-status'
import type { LicensesNavigationIntent } from '../types/navigation'
import type { Theme } from '../utils/theme'

type AppRootProps = {
  initialTheme: Theme
}

function UnlockedApp({ initialTheme }: AppRootProps) {
  useAutoLock()
  useLicenseStatusRefresh()

  const licenses = useLicenseStore((state) => state.licenses)
  const expiringThresholdDays = useAppStore(
    (state) => state.settings.expiringThresholdDays,
  )
  const setStatusFilter = useLicenseFilterStore((state) => state.setStatusFilter)

  const expiringCount = countExpiringLicenses(licenses, expiringThresholdDays)
  useDocumentTitle(expiringCount)

  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [activeView, setActiveView] = useState<AppView>('dashboard')
  const [licensesIntent, setLicensesIntent] =
    useState<LicensesNavigationIntent | null>(null)

  const navigateToLicensesWithStatus = (status: LicenseStatus) => {
    setStatusFilter(status)
    setLicensesIntent(null)
    setActiveView('licenses')
  }

  const navigateToLicense = (license: License) => {
    setLicensesIntent({ kind: 'edit', licenseId: license.id })
    setActiveView('licenses')
  }

  return (
    <>
      <AppLayout
        initialTheme={initialTheme}
        activeView={activeView}
        onNavigate={setActiveView}
      >
        {activeView === 'dashboard' ? (
          <DashboardPanel
            onFilterByStatus={navigateToLicensesWithStatus}
            onOpenLicense={navigateToLicense}
          />
        ) : null}
        {activeView === 'licenses' ? (
          <DemoPanel
            intent={licensesIntent}
            onIntentHandled={() => setLicensesIntent(null)}
          />
        ) : null}
        {activeView === 'categories' ? <CategoryPanel /> : null}
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
