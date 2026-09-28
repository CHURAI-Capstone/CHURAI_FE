import axios from 'axios'

import { env } from '@/constants/env'

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