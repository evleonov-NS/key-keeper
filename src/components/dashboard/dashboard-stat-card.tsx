import type { LicenseStatus } from '../../types/license-status'
import type { LicenseStatusCardConfig } from '../../constants/license-status-cards'

type DashboardStatCardProps = {
  card: LicenseStatusCardConfig
  count: number
  animationDelayMs: number
  onClick: (status: LicenseStatus) => void
}

export function DashboardStatCard({
  card,
  count,
  animationDelayMs,
  onClick,
}: DashboardStatCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(card.status)}
      title={`${card.label}: перейти к списку`}
      className="fade-in-stagger flex aspect-square min-w-0 flex-col items-center justify-center rounded-xl border border-border bg-surface p-1 text-center transition-all duration-theme hover:shadow-card sm:aspect-auto sm:items-start sm:px-4 sm:py-3 sm:text-left"
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <p className="text-[9px] leading-tight text-muted sm:hidden">{card.shortLabel}</p>
      <p className="hidden text-xs text-muted sm:block">{card.label}</p>
      <p
        className={`text-base font-semibold leading-none sm:mt-1 sm:text-2xl ${card.tone}`}
      >
        {count}
      </p>
    </button>
  )
}
