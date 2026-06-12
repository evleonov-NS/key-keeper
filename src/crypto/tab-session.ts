/**
 * Сессия вкладки в sessionStorage — переживает F5, очищается при закрытии вкладки.
 * Ключ экспортируется как JWK; пароль на диск не пишется.
 */
const TAB_SESSION_KEY = 'key-keeper-tab-session'

type TabSessionPayload = {
  keyJwk: JsonWebKey
  keepSessionOpen: boolean
  expiresAt: number | null
}

export async function exportVaultKey(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey('jwk', key)
}

export async function importVaultKey(jwk: JsonWebKey): Promise<CryptoKey> {
  // extractable: true — нужно для продления сессии вкладки (touchTabSession / saveTabSession)
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
}

export async function saveTabSession(
  key: CryptoKey,
  keepSessionOpen: boolean,
  autoLockMinutes: number,
): Promise<void> {
  const keyJwk = await exportVaultKey(key)
  const payload: TabSessionPayload = {
    keyJwk,
    keepSessionOpen,
    expiresAt: keepSessionOpen
      ? null
      : Date.now() + autoLockMinutes * 60 * 1000,
  }
  sessionStorage.setItem(TAB_SESSION_KEY, JSON.stringify(payload))
}

export function touchTabSession(autoLockMinutes: number): void {
  const raw = sessionStorage.getItem(TAB_SESSION_KEY)
  if (!raw) {
    return
  }

  const payload = JSON.parse(raw) as TabSessionPayload
  if (payload.keepSessionOpen) {
    return
  }

  payload.expiresAt = Date.now() + autoLockMinutes * 60 * 1000
  sessionStorage.setItem(TAB_SESSION_KEY, JSON.stringify(payload))
}

export function isTabSessionExpired(): boolean {
  const raw = sessionStorage.getItem(TAB_SESSION_KEY)
  if (!raw) {
    return true
  }

  const payload = JSON.parse(raw) as TabSessionPayload
  if (payload.keepSessionOpen || payload.expiresAt === null) {
    return false
  }

  return payload.expiresAt < Date.now()
}

export async function loadTabSessionKey(): Promise<CryptoKey | null> {
  if (isTabSessionExpired()) {
    clearTabSession()
    return null
  }

  const raw = sessionStorage.getItem(TAB_SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    const payload = JSON.parse(raw) as TabSessionPayload
    return importVaultKey(payload.keyJwk)
  } catch {
    clearTabSession()
    return null
  }
}

export function clearTabSession(): void {
  sessionStorage.removeItem(TAB_SESSION_KEY)
}
