import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'

import Logo from '@/assets/icons/logo.svg?react'
import { routePaths } from '@/router/paths'

interface AuthLayoutProps extends PropsWithChildren {
  title: string
  description: string
}

export function AuthLayout({ children, description, title }: AuthLayoutProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-5 py-10">
      <section className="w-full max-w-[430px]" aria-labelledby="auth-title">
        <div className="mb-12 text-center">
          <Link
            to={routePaths.home}
            className="inline-flex text-main"
            aria-label="츄라이 홈"
          >
            <Logo className="h-14 w-auto" />
          </Link>

          <p className="mt-3 text-sm text-gray-500">
            비주류라고? 일단 츄라이!
          </p>
        </div>

        <div>
          <h1 id="auth-title" className="text-[26px] font-bold tracking-tight text-black">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray3">{description}</p>
        </div>

        {children}
      </section>
    </main>
  )
}
