import { useEffect, useRef } from 'react'
import { touchTabSession } from '../crypto/tab-session'
import { useAppStore } from '../store/app-store'
import { useAuthStore } from '../store/auth-store'

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const

export function useAutoLock(): void {
  const phase = useAuthStore((state) => state.phase)
  const lock = useAuthStore((state) => state.lock)
  const keepSessionOpen = useAppStore((state) => state.settings.keepSessionOpen)
  const autoLockMinutes = useAppStore((state) => state.settings.autoLockMinutes)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (phase !== 'unlocked' || keepSessionOpen) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const resetTimer = () => {
      touchTabSession(autoLockMinutes)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(
        () => lock(),
        autoLockMinutes * 60 * 1000,
      )
    }

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, resetTimer, { passive: true })
    }
    resetTimer()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, resetTimer)
      }
    }
  }, [phase, keepSessionOpen, autoLockMinutes, lock])
}
