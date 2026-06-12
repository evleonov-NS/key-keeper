import {
  createVerificationBlock,
  decryptBuffer,
  deriveVaultKey,
  encryptBuffer,
  generateSalt,
  getSessionKey,
  loadTabSessionKey,
  setSessionKey,
  verifyMasterPassword,
} from '../crypto'
import { SALT_BYTE_LENGTH } from '../crypto/constants'
import type { VaultData } from '../types'
import { dexieStorage } from './dexie-storage-adapter'
import { deserializeVaultData, serializeVaultData } from './vault-serializer'

export async function isVaultInitialized(): Promise<boolean> {
  const record = await dexieStorage.read()
  return record !== null
}

export async function createVault(
  password: string,
  vaultData: VaultData,
): Promise<void> {
  const salt = generateSalt(SALT_BYTE_LENGTH)
  const key = await deriveVaultKey(password, salt)
  const verificationBlock = await createVerificationBlock(key)
  const plaintext = await serializeVaultData(vaultData)
  const encryptedBlob = await encryptBuffer(key, plaintext)

  await dexieStorage.write({ encryptedBlob, salt, verificationBlock })
  setSessionKey(key)
}

export async function unlockVaultWithKey(key: CryptoKey): Promise<VaultData> {
  const record = await dexieStorage.read()
  if (!record) {
    throw new Error('Хранилище не найдено')
  }

  const valid = await verifyMasterPassword(key, record.verificationBlock)
  if (!valid) {
    throw new Error('Сессия недействительна')
  }

  const plaintext = await decryptBuffer(key, record.encryptedBlob)
  const vaultData = deserializeVaultData(plaintext)
  setSessionKey(key)
  return vaultData
}

export async function unlockVault(password: string): Promise<VaultData> {
  const record = await dexieStorage.read()
  if (!record) {
    throw new Error('Хранилище не найдено')
  }

  const key = await deriveVaultKey(password, record.salt)
  const valid = await verifyMasterPassword(key, record.verificationBlock)
  if (!valid) {
    throw new Error('Неверный мастер-пароль')
  }

  return unlockVaultWithKey(key)
}

export async function tryRestoreTabSession(): Promise<VaultData | null> {
  const key = await loadTabSessionKey()
  if (!key) {
    return null
  }

  try {
    return await unlockVaultWithKey(key)
  } catch {
    return null
  }
}

export async function persistVault(vaultData: VaultData): Promise<void> {
  const key = getSessionKey()
  if (!key) {
    throw new Error('Сессия заблокирована')
  }

  const record = await dexieStorage.read()
  if (!record) {
    throw new Error('Хранилище не найдено')
  }

  const plaintext = await serializeVaultData(vaultData)
  const encryptedBlob = await encryptBuffer(key, plaintext)
  await dexieStorage.write({
    encryptedBlob,
    salt: record.salt,
    verificationBlock: record.verificationBlock,
  })
}

export async function changeMasterPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const record = await dexieStorage.read()
  if (!record) {
    throw new Error('Хранилище не найдено')
  }

  const oldKey = await deriveVaultKey(currentPassword, record.salt)
  const valid = await verifyMasterPassword(oldKey, record.verificationBlock)
  if (!valid) {
    throw new Error('Неверный текущий пароль')
  }

  const plaintext = await decryptBuffer(oldKey, record.encryptedBlob)
  const newSalt = generateSalt(SALT_BYTE_LENGTH)
  const newKey = await deriveVaultKey(newPassword, newSalt)
  const verificationBlock = await createVerificationBlock(newKey)
  const encryptedBlob = await encryptBuffer(newKey, plaintext)

  await dexieStorage.write({
    encryptedBlob,
    salt: newSalt,
    verificationBlock,
  })
  setSessionKey(newKey)
}
