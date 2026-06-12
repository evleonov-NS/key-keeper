import Dexie, { type Table } from 'dexie'
import type { StoredVaultRecord } from './storage-adapter'

const VAULT_ROW_ID = 1

type VaultRow = StoredVaultRecord & { id: number }

export class KeyKeeperDatabase extends Dexie {
  vault!: Table<VaultRow>

  constructor() {
    super('key-keeper')
    this.version(1).stores({
      vault: 'id',
    })
  }
}

export const db = new KeyKeeperDatabase()

export { VAULT_ROW_ID }
