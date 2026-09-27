import axios from 'axios'

import { env } from '@/constants/env'
import {
  getAccessToken,
  removeAccessToken,
} from '@/features/auth/tokenStorage'
import { routePaths } from '@/routes/paths'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      removeAccessToken()

      if (window.location.pathname !== routePaths.login) {
        window.location.replace(routePaths.login)
      }
    }

    return Promise.reject(error)
  },
)