import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/home/HomePage'
import { routePaths } from '@/routes/paths'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: routePaths.home,
        element: <HomePage />,
      },
    ],
  },
])
