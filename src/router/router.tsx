import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { BoardCreatePage } from '@/pages/boardCreate/BoardCreatePage'
import { HomePage } from '@/pages/home/HomePage'
import { LoginPage } from '@/pages/login/LoginPage'
import { SignupPage } from '@/pages/signup/SignupPage'
import { routePaths } from '@/router/paths'

export const router = createBrowserRouter([
  {
    path: routePaths.login,
    element: <LoginPage />,
  },
  {
    path: routePaths.signup,
    element: <SignupPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: routePaths.home,
            element: <HomePage />,
          },
          {
            path: routePaths.boardCreate,
            element: <BoardCreatePage />,
          },
        ],
      },
    ],
  },
])
