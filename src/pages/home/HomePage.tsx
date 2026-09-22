import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

const foundations = [
  ['React + TypeScript', '엄격한 타입 검사와 경로 별칭이 적용되어 있습니다.'],
  ['Vite', '빠른 개발 서버와 프로덕션 빌드를 사용합니다.'],
  ['Tailwind CSS', '디자인 토큰 기반의 공통 스타일을 제공합니다.'],
]

export function HomePage() {
  return (
    <Container className="py-16 sm:py-24">
      <section id="start" className="mx-auto max-w-3xl text-center">
        <span className="inline-flex rounded-full bg-primary-subtle px-3 py-1 text-sm font-semibold text-primary">Frontend Foundation</span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">CHURAI 프론트엔드</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">기능 개발을 바로 시작할 수 있도록 프로젝트 기반과 공통 UI 구조를 준비했습니다.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg">시작하기</Button>
          <Button size="lg" variant="secondary">구조 살펴보기</Button>
        </div>
      </section>
      <section className="mt-16 grid gap-4 sm:grid-cols-3" aria-label="프로젝트 구성">
        {foundations.map(([title, description]) => (
          <article key={title} className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </article>
        ))}
      </section>
    </Container>
  )
}
