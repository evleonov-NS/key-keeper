import { describe, expect, it } from 'vitest'
import { createDemoVaultData } from '../data/demo-seed'
import {
  VaultFileError,
  assertSchemaVersionSupported,
  createVaultFileBytes,
  decryptVaultFile,
} from './vault-file'

describe('vault-file', () => {
  it('roundtrip: экспорт и расшифровка под тем же паролем', async () => {
    const vault = createDemoVaultData()
    const password = 'BackupFile1'
    const bytes = await createVaultFileBytes(vault, password)
    const restored = await decryptVaultFile(bytes, password)

    expect(restored.licenses).toHaveLength(vault.licenses.length)
    expect(restored.categories).toHaveLength(vault.categories.length)
    expect(restored.schemaVersion).toBe(vault.schemaVersion)
  })

  it('неверный пароль файла — ошибка', async () => {
    const vault = createDemoVaultData()
    const bytes = await createVaultFileBytes(vault, 'CorrectPass1')

    await expect(decryptVaultFile(bytes, 'WrongPass1')).rejects.toThrow(
      VaultFileError,
    )
    await expect(decryptVaultFile(bytes, 'WrongPass1')).rejects.toThrow(
      'Неверный пароль файла',
    )
  })

  it('несовместимая schemaVersion — ошибка', () => {
    expect(() => assertSchemaVersionSupported(99)).toThrow(VaultFileError)
    expect(() => assertSchemaVersionSupported(99)).toThrow('Несовместимая версия')
  })
})
