import { useCallback, useEffect, useRef, useState } from 'react'
import type { ToastItem } from '../components/ui/toast'
import { TOAST_AUTO_DISMISS_MS } from '../components/ui/toast'
import { generateId } from '../utils/id'

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<string, number>>(new Map())

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string) => {
      const id = generateId()
      setToasts((current) => [...current, { id, message }])

      const timer = window.setTimeout(() => {
        dismissToast(id)
      }, TOAST_AUTO_DISMISS_MS)
      timersRef.current.set(id, timer)
    },
    [dismissToast],
  )

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer)
      }
      timers.clear()
    }
  }, [])

  return { toasts, showToast, dismissToast }
}
