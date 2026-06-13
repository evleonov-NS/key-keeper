import { useEffect } from 'react'

const BASE_TITLE = 'key-keeper'

export function useDocumentTitle(expiringCount: number): void {
  useEffect(() => {
    document.title =
      expiringCount > 0 ? `(${expiringCount}) ${BASE_TITLE}` : BASE_TITLE

    return () => {
      document.title = BASE_TITLE
    }
  }, [expiringCount])
}
