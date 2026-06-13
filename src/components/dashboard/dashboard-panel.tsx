import { useMemo } from 'react'
import { LayoutDashboard } from 'lucide-react'
import type { License } from '../../types/license'
import type { LicenseStatus } from '../../types/license-status'
import { DASHBOARD_STATUS_CARDS } from '../../constants/license-status-cards'
import { useAppStore } from '../../store/app-store'
import { useLicenseStore } from '../../store/license-store'
import { countAttentionLicenses, getAttentionLicenses } from '../../utils/reminders'
import { countLicensesByStatus } from '../../utils/status'
import { AttentionList } from './attention-list'
import { DashboardStatCard } from './dashboard-stat-card'

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

  const attention = useMemo(
    () => getAttentionLicenses(licenses, expiringThresholdDays),
    [licenses, expiringThresholdDays],
  )

  const attentionCount = countAttentionLicenses(licenses, expiringThresholdDays)

  return (
    <div className="space-y-6">
      <section className="fade-in rounded-card border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
        <div className="flex items-start gap-3">
          <LayoutDashboard size={22} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Дашборд</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Сводка по лицензиям: что активно, что скоро истекает и что просрочено.
              {attentionCount > 0 ? (
                <span className="text-amber-700 dark:text-amber-400">
                  {' '}
                  Требуют внимания: {attentionCount}.
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
        <h2 className="text-lg font-semibold">Требуют внимания</h2>
        <p className="mt-1 text-sm text-muted">
          Истекающие и просроченные лицензии с включённым напоминанием — по срочности.
        </p>

        <div className="mt-4">
          <AttentionList licenses={attention} onOpenLicense={onOpenLicense} />
        </div>
      </section>
    </div>
  )
}
