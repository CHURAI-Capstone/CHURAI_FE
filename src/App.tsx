import { AppProviders } from '@/app/AppProviders'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/HomePage'

export function App() {
  return (
    <AppProviders>
      <AppLayout>
        <HomePage />
      </AppLayout>
    </AppProviders>
  )
}
