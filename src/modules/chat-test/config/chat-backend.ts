export type ChatBackendMode = 'local' | 'server'

export const CHAT_MODE_STORAGE_KEY = 'joms_chat_backend_mode'
export const CHAT_LOCAL_BASE_URL = 'http://localhost:8009'
export const CHAT_SERVER_BASE_URL = 'https://chat.api.kods.online'

export const resolveChatBaseUrl = (mode: ChatBackendMode) =>
  mode === 'server' ? CHAT_SERVER_BASE_URL : CHAT_LOCAL_BASE_URL

export const loadChatBackendMode = (): ChatBackendMode => {
  try {
    const raw = localStorage.getItem(CHAT_MODE_STORAGE_KEY)
    return raw === 'server' ? 'server' : 'local'
  } catch {
    return 'local'
  }
}

export const saveChatBackendMode = (mode: ChatBackendMode) => {
  try {
    localStorage.setItem(CHAT_MODE_STORAGE_KEY, mode)
  } catch {
    // ignore storage failures
  }
}
