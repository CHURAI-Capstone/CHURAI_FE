import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import CreateButton from '@/assets/icons/create-button.svg?react'
import Logo from '@/assets/icons/logo.svg?react'
import SearchIcon from '@/assets/icons/search.svg?react'

const HIDE_FAB_PREFIXES = [
  '/boardCreate',
  '/boardDetail',
]

export function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const showFab = !HIDE_FAB_PREFIXES.some(
    (prefix) => pathname.startsWith(prefix),
  )

  return (
    <div
      className="bg-gray1 relative mx-auto flex min-h-dvh w-full max-w-107.5 flex-col overflow-x-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom:
          'env(safe-area-inset-bottom)',
      }}
    >
      <header className="bg-main relative mb-6 flex h-14 items-center justify-center text-white">
        <Logo
          className="h-9 cursor-pointer text-white"
          onClick={() => navigate('/')}
        />

        <SearchIcon
          className="hover:text-gray2 absolute right-7 cursor-pointer"
          onClick={() => navigate('/search')}
        />
      </header>

      <Outlet />

      {showFab && (
        <button
          type="button"
          onClick={() =>
            navigate('/boardCreate')
          }
          className="bg-main fixed right-6 bottom-6 z-50 rounded-full p-3 shadow-lg"
          aria-label="레시피 작성"
        >
          <CreateButton className="h-7 w-7" />
        </button>
      )}
    </div>
  )
}
