import axios, {
  type InternalAxiosRequestConfig,
} from 'axios'

import { env } from '@/constants/env'
import {
  getAccessToken,
  removeAccessToken,
} from '@/features/auth/tokenStorage'

const BASE_URL = env.apiBaseUrl

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const fileApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

const attachAuthHeader = (
  config: InternalAxiosRequestConfig,
) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
}

const handleUnauthorizedResponse = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    removeAccessToken()
  }

  return Promise.reject(error)
}

api.interceptors.request.use(attachAuthHeader)
fileApi.interceptors.request.use(attachAuthHeader)

api.interceptors.response.use(
  (response) => response,
  handleUnauthorizedResponse,
)
fileApi.interceptors.response.use(
  (response) => response,
  handleUnauthorizedResponse,
)
