import { useMemo } from 'react'
import { LayoutDashboard } from 'lucide-react'
import type { License } from '../../types/license'
import type { LicenseStatus } from '../../types/license-status'
import { DASHBOARD_STATUS_CARDS } from '../../constants/license-status-cards'
import { useAppStore } from '../../store/app-store'
import { useLicenseStore } from '../../store/license-store'
import { countExpiringLicenses, getExpiringSoonLicenses } from '../../utils/dashboard'
import { countLicensesByStatus } from '../../utils/status'
import { DashboardStatCard } from './dashboard-stat-card'
import { ExpiringSoonList } from './expiring-soon-list'

type DashboardPanelProps = {
  onFilterByStatus: (status: LicenseStatus) => void
  onOpenLicense: (license: License) => void
}

export function DashboardPanel({
  onFilterByStatus,
  onOpenLicense,
}: DashboardPanelProps) {
  const licenses = useLicenseStore((state) => state.licenses)
  const expiringThresholdDays = useAppStore(
    (state) => state.settings.expiringThresholdDays,
  )

  const statusCounts = useMemo(
    () => countLicensesByStatus(licenses, expiringThresholdDays),
    [licenses, expiringThresholdDays],
  )

  const expiringSoon = useMemo(
    () => getExpiringSoonLicenses(licenses, expiringThresholdDays),
    [licenses, expiringThresholdDays],
  )

  const expiringCount = countExpiringLicenses(licenses, expiringThresholdDays)

  return (
    <div className="space-y-6">
      <section className="fade-in rounded-card border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
        <div className="flex items-start gap-3">
          <LayoutDashboard size={22} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Дашборд</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Сводка по лицензиям: что активно, что скоро истекает и что просрочено.
              {expiringCount > 0 ? (
                <span className="text-amber-700 dark:text-amber-400">
                  {' '}
                  Истекает скоро: {expiringCount}.
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-1.5 sm:gap-3">
          {DASHBOARD_STATUS_CARDS.map((card, index) => (
            <DashboardStatCard
              key={card.status}
              card={card}
              count={statusCounts[card.status]}
              animationDelayMs={index * 50}
              onClick={onFilterByStatus}
            />
          ))}
        </div>
      </section>

      <section className="fade-in rounded-card border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
        <h2 className="text-lg font-semibold">Истекает скоро</h2>
        <p className="mt-1 text-sm text-muted">
          Лицензии в пределах порога «истекает» — отсортированы по сроку.
        </p>

        <div className="mt-4">
          <ExpiringSoonList
            licenses={expiringSoon}
            onOpenLicense={onOpenLicense}
          />
        </div>
      </section>
    </div>
  )
}
