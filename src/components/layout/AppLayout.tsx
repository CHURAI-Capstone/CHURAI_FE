import { Link, Outlet } from 'react-router-dom'

import { Container } from '@/components/ui/Container'
import { routePaths } from '@/routes/paths'

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border bg-surface/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Link className="text-lg font-bold tracking-tight text-primary" to={routePaths.home}>CHURAI</Link>
          <nav aria-label="주요 메뉴">
            <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="#start">시작하기</a>
          </nav>
        </Container>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-border bg-surface">
        <Container className="py-6 text-sm text-muted-foreground">© {new Date().getFullYear()} CHURAI</Container>
      </footer>
    </div>
  )
}
