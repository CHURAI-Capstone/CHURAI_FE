export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResult {
  accessToken: string
}

export interface AuthContextValue {
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  logout: () => void
}