/**
 * Chat harness users. Do not commit JWTs or phones.
 * Set VITE_CHAT_TEST_USERS_JSON to a JSON array of
 * { id, username, phone_e164, accessToken } from `pnpm mint-static-users`.
 */
export type StaticChatUser = {
  id: string
  username: string
  phone_e164: string
  accessToken: string
}

function readUsersFromEnv(): StaticChatUser[] {
  const raw = import.meta.env.VITE_CHAT_TEST_USERS_JSON
  if (!raw || typeof raw !== 'string') return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (row): row is StaticChatUser =>
        Boolean(
          row &&
            typeof row === 'object' &&
            typeof (row as StaticChatUser).id === 'string' &&
            typeof (row as StaticChatUser).accessToken === 'string',
        ),
    )
  } catch {
    return []
  }
}

export const STATIC_CHAT_USERS: StaticChatUser[] = readUsersFromEnv()
