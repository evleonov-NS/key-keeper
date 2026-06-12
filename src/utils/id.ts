/** Уникальный id записи */
export function generateId(): string {
  return crypto.randomUUID()
}
