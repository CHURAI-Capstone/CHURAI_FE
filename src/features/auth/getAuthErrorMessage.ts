import axios from 'axios'

import type { ApiErrorResponse } from '@/types/api'

export function getAuthErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallbackMessage
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}
