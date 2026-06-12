import { useEffect, useState } from 'react'

/** Object URL для превью Blob; отзывает при размонтировании и смене списка */
export function useBlobUrls(blobs: Blob[]): string[] {
  const [urls, setUrls] = useState<string[]>([])

  useEffect(() => {
    const nextUrls = blobs.map((blob) => URL.createObjectURL(blob))
    setUrls(nextUrls)

    return () => {
      for (const url of nextUrls) {
        URL.revokeObjectURL(url)
      }
    }
  }, [blobs])

  return urls
}
