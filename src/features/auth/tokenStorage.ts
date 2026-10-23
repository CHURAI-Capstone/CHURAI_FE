const ACCESS_TOKEN_KEY = 'churai.accessToken'
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function subscribeToAccessToken(listener: () => void) {
  listeners.add(listener)

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ACCESS_TOKEN_KEY || event.key === null) {
      listener()
    }
  }

  window.addEventListener('storage', handleStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', handleStorage)
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  notifyListeners()
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  notifyListeners()
}

export function hasAccessToken() {
  return Boolean(getAccessToken())
}
