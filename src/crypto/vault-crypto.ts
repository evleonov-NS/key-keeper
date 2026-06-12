import {
  GCM_IV_LENGTH,
  PBKDF2_ITERATIONS,
  VERIFICATION_PLAINTEXT,
} from './constants'

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function packIvAndCiphertext(iv: Uint8Array, ciphertext: ArrayBuffer): ArrayBuffer {
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.length)
  return combined.buffer
}

function unpackIvAndCiphertext(buffer: ArrayBuffer): {
  iv: Uint8Array
  ciphertext: ArrayBuffer
} {
  const bytes = new Uint8Array(buffer)
  return {
    iv: bytes.slice(0, GCM_IV_LENGTH),
    ciphertext: bytes.slice(GCM_IV_LENGTH).buffer,
  }
}

export async function deriveVaultKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptBuffer(
  key: CryptoKey,
  plaintext: ArrayBuffer,
): Promise<ArrayBuffer> {
  const iv = crypto.getRandomValues(new Uint8Array(GCM_IV_LENGTH))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext,
  )
  return packIvAndCiphertext(iv, ciphertext)
}

export async function decryptBuffer(
  key: CryptoKey,
  packed: ArrayBuffer,
): Promise<ArrayBuffer> {
  const { iv, ciphertext } = unpackIvAndCiphertext(packed)
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
}

export async function createVerificationBlock(key: CryptoKey): Promise<ArrayBuffer> {
  return encryptBuffer(key, textEncoder.encode(VERIFICATION_PLAINTEXT).buffer)
}

export async function verifyMasterPassword(
  key: CryptoKey,
  verificationBlock: ArrayBuffer,
): Promise<boolean> {
  try {
    const decrypted = await decryptBuffer(key, verificationBlock)
    return textDecoder.decode(decrypted) === VERIFICATION_PLAINTEXT
  } catch {
    return false
  }
}

export function generateSalt(byteLength: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(byteLength))
}
