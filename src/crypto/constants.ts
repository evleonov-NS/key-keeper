/** PBKDF2-HMAC-SHA-256 — рекомендация OWASP */
export const PBKDF2_ITERATIONS = 600_000

export const SALT_BYTE_LENGTH = 16

export const GCM_IV_LENGTH = 12

/** Известный plaintext для verificationBlock */
export const VERIFICATION_PLAINTEXT = 'key-keeper-vault-v1'

export const MIN_MASTER_PASSWORD_LENGTH = 8
