/** Ключ AES-GCM только в памяти — никогда на диск */
let sessionKey: CryptoKey | null = null

export function setSessionKey(key: CryptoKey | null): void {
  sessionKey = key
}

export function getSessionKey(): CryptoKey | null {
  return sessionKey
}

export function clearSessionKey(): void {
  sessionKey = null
}
