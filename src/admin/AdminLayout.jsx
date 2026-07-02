import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

const NAV = [
  { to: '/admin',         label: 'Dashboard', end: true },
  { to: '/admin/books',   label: 'Books' },
  { to: '/admin/genres',  label: 'Genres' },
  { to: '/admin/series',  label: 'Series' },
  { to: '/admin/theme',   label: 'Theme' },
  { to: '/admin/content', label: 'Content' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut(auth)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-48 bg-deep-space-blue text-mint-cream flex flex-col shrink-0">
        <div className="px-5 py-4 text-sm font-semibold border-b border-white/10">
          Admin Panel
        </div>
        <nav className="flex-1 py-2">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-5 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-white/10 font-medium' : 'hover:bg-white/5 text-mint-cream/80'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="text-sm text-mint-cream/50 hover:text-mint-cream transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-6xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
