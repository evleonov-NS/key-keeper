import dayjs from 'dayjs'
import { useAppStore } from '../store/app-store'
import { persistVault } from '../storage/vault-service'
import { downloadBytes } from '../utils/download'
import { createVaultFileBytes, decryptVaultFile } from './vault-file'
import { applyImportMode, type ImportMode } from './vault-merge'

export async function exportVaultBackup(filePassword: string): Promise<void> {
  const vaultData = useAppStore.getState().getVaultData()
  const bytes = await createVaultFileBytes(vaultData, filePassword)
  const filename = `key-keeper-backup-${dayjs().format('YYYY-MM-DD')}.vault`
  downloadBytes(filename, bytes)

  useAppStore.getState().markExportCompleted()
  await persistVault(useAppStore.getState().getVaultData())
}

export async function importVaultBackup(
  fileBytes: Uint8Array,
  filePassword: string,
  mode: ImportMode,
): Promise<void> {
  const imported = await decryptVaultFile(fileBytes, filePassword)
  const current = useAppStore.getState().getVaultData()
  const result = applyImportMode(current, imported, mode)

  useAppStore.getState().applyVaultData(result)
  await persistVault(result)
}
