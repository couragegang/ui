/** Платформо-независимое key-value хранилище (web: localStorage, mobile: SecureStore). */
export type KeyValueStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function createLocalStorageAdapter(storage: Storage = localStorage): KeyValueStorage {
  return {
    getItem: (key) => storage.getItem(key),
    setItem: (key, value) => storage.setItem(key, value),
    removeItem: (key) => storage.removeItem(key),
  }
}
