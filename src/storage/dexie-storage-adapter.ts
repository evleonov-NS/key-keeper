import type { StorageAdapter, StoredVaultRecord } from './storage-adapter'
import { db, VAULT_ROW_ID } from './db'

export class DexieStorageAdapter implements StorageAdapter {
  async read(): Promise<StoredVaultRecord | null> {
    const row = await db.vault.get(VAULT_ROW_ID)
    if (!row) {
      return null
    }

    return {
      encryptedBlob: row.encryptedBlob,
      salt: row.salt,
      verificationBlock: row.verificationBlock,
    }
  }

  async write(record: StoredVaultRecord): Promise<void> {
    await db.vault.put({
      id: VAULT_ROW_ID,
      ...record,
    })
  }

  async clear(): Promise<void> {
    await db.vault.delete(VAULT_ROW_ID)
  }
}

export const dexieStorage = new DexieStorageAdapter()
