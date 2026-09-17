export const MY_PROFILE_PATH = '/settings/access/my-profile'
export const AUTHENTICATOR_SETUP_QUERY = 'setupAuthenticator'

export function myProfileAuthenticatorSetupPath() {
  return `${MY_PROFILE_PATH}?${AUTHENTICATOR_SETUP_QUERY}=1`
}

export function isAuthenticatorSetupRoute(pathname: string, search: string) {
  const params = new URLSearchParams(search)
  return pathname === MY_PROFILE_PATH && params.get(AUTHENTICATOR_SETUP_QUERY) === '1'
}
