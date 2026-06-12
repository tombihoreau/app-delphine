import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

const CalendarIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M8 3v4M16 3v4M4 10h16" />
    {active && <circle cx="12" cy="15" r="2.5" fill="currentColor" stroke="none" />}
  </svg>
)

const ProgramsIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M8 9h8M8 12h8M8 15h5M6 9h.01M6 12h.01M6 15h.01" />
  </svg>
)

const ClientsIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M16 19a4 4 0 0 0-8 0" />
    <circle cx="12" cy="10" r="3.5" />
    <path d="M20 19a3.5 3.5 0 0 0-2.5-3.35M17.5 7.3A3.5 3.5 0 0 1 20 10.7" />
  </svg>
)

const HomeIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 10.5 12 5l7 5.5V19H5z" />
    {active && <path d="M9.5 19v-5h5v5" />}
  </svg>
)

const ProgressIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 19V6M4 19h16M9 19v-8M14 19v-4M19 19V9" />
  </svg>
)

const BottomNav = () => {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (!isAuthenticated) return null
  if (location.pathname === '/set-password') return null
  if (location.pathname.startsWith('/mood') || location.pathname.startsWith('/sessions/')) return null

  if (user?.role === 'admin') {
    const adminListPages = ['/admin/calendar', '/admin/programs', '/admin/clients']
    if (!adminListPages.includes(location.pathname)) return null
  }

  const navItems = user?.role === 'admin'
    ? [
        { path: '/admin/calendar', icon: CalendarIcon, label: 'Agenda' },
        { path: '/admin/programs', icon: ProgramsIcon, label: 'Programmes' },
        { path: '/admin/clients', icon: ClientsIcon, label: 'Clients' }
      ]
    : [
        { path: '/', icon: HomeIcon, label: 'Accueil' },
        { path: '/agenda', icon: CalendarIcon, label: 'Agenda' },
        { path: '/progres', icon: ProgressIcon, label: 'Espace' }
      ]

  const isActive = (path) => {
    if (path.startsWith('/admin')) {
      return location.pathname === path || location.pathname.startsWith(`${path}/`)
    }

    return location.pathname === path
  }

  return (
    <div className="bottom-nav-shell bottom-nav-shell-client">
      <div className="bottom-nav-inner bottom-nav-inner-client">
        {navItems.map((item) => {
          const active = isActive(item.path)
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${active ? 'nav-link-active' : ''}`}
            >
              <Icon active={active} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNav
