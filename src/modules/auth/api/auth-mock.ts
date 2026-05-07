type LoginPayload = {
  email: string
  password: string
}

type LoginResponse = {
  accessToken: string
  user: {
    id: string
    email: string
    role: 'admin' | 'manager'
  }
}

export async function loginMock(payload: LoginPayload): Promise<LoginResponse> {
  const email = payload.email.trim().toLowerCase()

  if (email !== 'admin@gmail.com') {
    throw new Error('Invalid email')
  }

  return {
    accessToken: 'mock-access-token',
    user: {
      id: 'admin-1',
      email,
      role: 'admin',
    },
  }
}

