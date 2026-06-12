/**
 * Содержимое vault на диске — только зашифрованный блоб и крипто-метаданные.
 * Реализация (Dexie / файл Tauri) — на Этапе 2 и 11.
 */
export type StoredVaultRecord = {
  encryptedBlob: ArrayBuffer
  salt: Uint8Array
  verificationBlock: ArrayBuffer
}

export interface StorageAdapter {
  /** Прочитать запись vault или null, если хранилище пустое */
  read(): Promise<StoredVaultRecord | null>

  /** Перезаписать vault целиком */
  write(record: StoredVaultRecord): Promise<void>

  /** Удалить vault (сброс) */
  clear(): Promise<void>
}
