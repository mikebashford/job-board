import { Link, useLocation } from 'react-router-dom'

const Header = () => {
  const { pathname } = useLocation()
  return (
    <header className="w-full bg-white shadow sticky top-0 z-50">
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-blue-700 font-bold text-xl"
          aria-label="Job Board Home"
        >
          <span
            className="inline-block w-8 h-8 bg-blue-600 rounded-full mr-2"
            aria-hidden="true"
          ></span>
          Job Board
        </Link>
        <div className="flex gap-6">
          <Link
            to="/"
            className={`font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 px-2 py-1 rounded ${pathname === '/' ? 'text-blue-600' : 'text-gray-700'}`}
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            Home
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Header
