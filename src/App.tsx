import { RouterProvider } from 'react-router-dom'

import { AppProviders } from '@/app/AppProviders'
import ErrorBoundary from '@/components/ErrorBoundary'
import { router } from '@/router/router'

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  )
}
