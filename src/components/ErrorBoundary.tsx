import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6">
          <p className="body1-semibold text-black">오류가 발생했습니다</p>
          <p className="caption1-regular text-gray3">잠시 후 다시 시도해주세요</p>
          <button
            className="caption1-medium mt-2 rounded-lg bg-main px-6 py-2 text-white"
            onClick={() => this.setState({ hasError: false })}
          >
            다시 시도
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
