import { decode, encode } from 'cbor-x'
import { SALT_BYTE_LENGTH } from '../crypto/constants'
import {
  createVerificationBlock,
  decryptBuffer,
  deriveVaultKey,
  encryptBuffer,
  generateSalt,
  verifyMasterPassword,
} from '../crypto/vault-crypto'
import { deserializeVaultData, serializeVaultData } from '../storage/vault-serializer'
import { SCHEMA_VERSION, type SchemaVersion } from '../types/schema'
import type { VaultData } from '../types/vault'

export const VAULT_FILE_MAGIC = 'key-keeper-vault' as const
export const VAULT_FILE_FORMAT_VERSION = 1 as const

export type VaultFileEnvelope = {
  magic: typeof VAULT_FILE_MAGIC
  formatVersion: number
  schemaVersion: SchemaVersion
  salt: Uint8Array
  verificationBlock: Uint8Array
  encryptedBlob: Uint8Array
  exportedAt: string
}

export class VaultFileError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VaultFileError'
  }
}

export async function createVaultFileBytes(
  vaultData: VaultData,
  filePassword: string,
): Promise<Uint8Array> {
  const salt = generateSalt(SALT_BYTE_LENGTH)
  const key = await deriveVaultKey(filePassword, salt)
  const verificationBlock = await createVerificationBlock(key)
  const plaintext = await serializeVaultData(vaultData)
  const encryptedBlob = await encryptBuffer(key, plaintext)

  const envelope: VaultFileEnvelope = {
    magic: VAULT_FILE_MAGIC,
    formatVersion: VAULT_FILE_FORMAT_VERSION,
    schemaVersion: vaultData.schemaVersion,
    salt,
    verificationBlock: new Uint8Array(verificationBlock),
    encryptedBlob: new Uint8Array(encryptedBlob),
    exportedAt: new Date().toISOString(),
  }

  return encode(envelope)
}

export function parseVaultFileEnvelope(bytes: Uint8Array): VaultFileEnvelope {
  let decoded: unknown
  try {
    decoded = decode(bytes)
  } catch {
    throw new VaultFileError(
      'Файл повреждён или не является резервной копией key-keeper',
    )
  }

  const envelope = decoded as Partial<VaultFileEnvelope>
  if (envelope.magic !== VAULT_FILE_MAGIC) {
    throw new VaultFileError('Неверный формат файла')
  }
  if (envelope.formatVersion !== VAULT_FILE_FORMAT_VERSION) {
    throw new VaultFileError('Неподдерживаемая версия формата файла')
  }

  const salt = toUint8Array(envelope.salt, 'salt')
  const verificationBlock = toUint8Array(envelope.verificationBlock, 'verificationBlock')
  const encryptedBlob = toUint8Array(envelope.encryptedBlob, 'encryptedBlob')

  if (typeof envelope.schemaVersion !== 'number') {
    throw new VaultFileError('Файл повреждён или неполный')
  }

  return {
    magic: VAULT_FILE_MAGIC,
    formatVersion: VAULT_FILE_FORMAT_VERSION,
    schemaVersion: envelope.schemaVersion as SchemaVersion,
    salt,
    verificationBlock,
    encryptedBlob,
    exportedAt: envelope.exportedAt ?? '',
  }
}

function toUint8Array(value: unknown, field: string): Uint8Array {
  if (value instanceof Uint8Array) {
    return value
  }
  if (Array.isArray(value)) {
    return new Uint8Array(value)
  }
  throw new VaultFileError(`Файл повреждён: поле ${field}`)
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer
}

export function assertSchemaVersionSupported(schemaVersion: number): void {
  if (schemaVersion !== SCHEMA_VERSION) {
    throw new VaultFileError(
      `Несовместимая версия схемы данных (${schemaVersion}). Текущая версия приложения: ${SCHEMA_VERSION}`,
    )
  }
}

export async function decryptVaultFile(
  bytes: Uint8Array,
  filePassword: string,
): Promise<VaultData> {
  const envelope = parseVaultFileEnvelope(bytes)
  assertSchemaVersionSupported(envelope.schemaVersion)

  const key = await deriveVaultKey(filePassword, envelope.salt)
  const valid = await verifyMasterPassword(key, toArrayBuffer(envelope.verificationBlock))
  if (!valid) {
    throw new VaultFileError('Неверный пароль файла')
  }

  const plaintext = await decryptBuffer(key, toArrayBuffer(envelope.encryptedBlob))
  const vaultData = deserializeVaultData(plaintext)

  if (vaultData.schemaVersion !== envelope.schemaVersion) {
    throw new VaultFileError('Содержимое файла не совпадает с метаданными')
  }

  return vaultData
}
