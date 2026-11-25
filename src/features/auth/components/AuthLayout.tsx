import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'

import Logo from '@/assets/icons/logo.svg?react'
import { routePaths } from '@/router/paths'

interface AuthLayoutProps extends PropsWithChildren {
  title: string
  description: string
}

export function AuthLayout({
  children,
  description,
  title,
}: AuthLayoutProps) {
  return (
    <main className="min-h-dvh bg-white">
      <div
        className="bg-gray1 mx-auto flex min-h-dvh w-full max-w-107.5 flex-col justify-center px-5 py-10"
        style={{
          paddingTop: 'max(40px, env(safe-area-inset-top))',
          paddingBottom: 'max(40px, env(safe-area-inset-bottom))',
        }}
      >
        <section
          className="w-full"
          aria-labelledby="auth-title"
        >
          <div className="mb-12 text-center">
            <Link
              to={routePaths.home}
              className="text-main inline-flex"
              aria-label="츄라이 홈"
            >
              <Logo className="h-14 w-auto" />
            </Link>

            <p className="text-gray3 mt-3 text-sm">
              비주류라고? 일단 츄라이!
            </p>
          </div>

          <div>
            <h1
              id="auth-title"
              className="text-[26px] font-bold tracking-tight text-black"
            >
              {title}
            </h1>

            <p className="text-gray3 mt-2 text-sm">
              {description}
            </p>
          </div>

          {children}
        </section>
      </div>
    </main>
  )
}