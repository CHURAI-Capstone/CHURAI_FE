export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResult {
  userId: number
  accessToken: string
}

export interface SignupRequest {
  email: string
  password: string
  nickname: string
}

export interface SignupResult {
  userId: number
}

export interface AuthContextValue {
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  logout: () => void
}
