const ACCESS_TOKEN_KEY = 'churai.accessToken'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function hasAccessToken() {
  return Boolean(getAccessToken())
}