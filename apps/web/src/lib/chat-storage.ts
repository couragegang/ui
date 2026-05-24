import { createChatStorage, createLocalStorageAdapter } from '@couragegang/shared'

export const chatStorage = createChatStorage(createLocalStorageAdapter())

export const {
  getLastActiveChatId,
  setLastActiveChatId,
  clearLastActiveChatId,
  resolveInitialChatId,
} = chatStorage
