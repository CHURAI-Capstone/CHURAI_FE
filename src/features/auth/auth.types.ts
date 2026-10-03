export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResult {
  userId: number
  accessToken: string
}

export interface AuthContextValue {
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  logout: () => void
}
