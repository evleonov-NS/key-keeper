import { useEffect } from 'react'
import { useLicenseStore } from '../store/license-store'

/** Пересчёт статусов при возврате на вкладку (смена календарного дня) */
export function useLicenseStatusRefresh(): void {
  const refreshAllStatuses = useLicenseStore((state) => state.refreshAllStatuses)

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshAllStatuses()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [refreshAllStatuses])
}
