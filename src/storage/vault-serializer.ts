import { decode, encode } from 'cbor-x'
import type { License } from '../types/license'
import type { VaultData } from '../types/vault'

type SerializableLicense = Omit<License, 'images'> & {
  images: Uint8Array[]
}

type SerializableVaultData = Omit<VaultData, 'licenses'> & {
  licenses: SerializableLicense[]
}

async function licenseToSerializable(license: License): Promise<SerializableLicense> {
  const images = await Promise.all(
    license.images.map(async (blob) => new Uint8Array(await blob.arrayBuffer())),
  )
  return { ...license, images }
}

function serializableToLicense(item: SerializableLicense): License {
  return {
    ...item,
    accountLogin: item.accountLogin ?? '',
    images: item.images.map((bytes) => new Blob([bytes], { type: 'image/webp' })),
  }
}

export async function serializeVaultData(vault: VaultData): Promise<ArrayBuffer> {
  const serializable: SerializableVaultData = {
    ...vault,
    licenses: await Promise.all(vault.licenses.map(licenseToSerializable)),
  }
  const encoded = encode(serializable)
  return encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength)
}

export function deserializeVaultData(buffer: ArrayBuffer): VaultData {
  const decoded = decode(new Uint8Array(buffer)) as SerializableVaultData
  return {
    ...decoded,
    licenses: decoded.licenses.map(serializableToLicense),
  }
}
