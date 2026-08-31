let registeredPushToken: string | null = null

export const setRegisteredPushToken = (token: string | null) => {
  registeredPushToken = token
}

export const getRegisteredPushToken = () => registeredPushToken
