interface AuthFeedbackProps {
  children: string
  tone?: 'error' | 'success'
}

export function AuthFeedback({ children, tone = 'error' }: AuthFeedbackProps) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={
        tone === 'error'
          ? 'rounded-lg bg-sub px-4 py-3 text-sm font-medium text-main'
          : 'rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700'
      }
    >
      {children}
    </p>
  )
}
