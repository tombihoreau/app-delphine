import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../store/useAuthStore'

const CalendarIcon = () => (
  <svg viewBox="0 0 16 18" className="h-6 w-6" fill="none">
    <path d="M4.60824 0.650391V3.81706M10.9416 0.650391V3.81706M0.649902 6.98372H14.8999M2.23324 2.23372H13.3166C14.191 2.23372 14.8999 2.94261 14.8999 3.81706V14.9004C14.8999 15.7748 14.191 16.4837 13.3166 16.4837H2.23324C1.35878 16.4837 0.649902 15.7748 0.649902 14.9004V3.81706C0.649902 2.94261 1.35878 2.23372 2.23324 2.23372Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ProgramsIcon = () => (
  <svg viewBox="0 0 17 18" className="h-6 w-6" fill="none">
    <path d="M0.649902 3.98372H3.98324M0.649902 7.31706H3.98324M0.649902 10.6504H3.98324M0.649902 13.9837H3.98324M6.8999 5.65039H11.0666M6.8999 8.98372H12.3166M6.8999 12.3171H10.6499M3.98324 0.650391H13.9832C14.9037 0.650391 15.6499 1.39658 15.6499 2.31706V15.6504C15.6499 16.5709 14.9037 17.3171 13.9832 17.3171H3.98324C3.06276 17.3171 2.31657 16.5709 2.31657 15.6504V2.31706C2.31657 1.39658 3.06276 0.650391 3.98324 0.650391Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ClientsIcon = () => (
  <svg viewBox="0 0 17 16" className="h-6 w-6" fill="none">
    <path d="M13.0946 14.6506C13.0946 13.0004 12.439 11.4177 11.2721 10.2508C10.1052 9.08387 8.5225 8.4283 6.87223 8.4283M6.87223 8.4283C5.22197 8.4283 3.63929 9.08387 2.47238 10.2508C1.30547 11.4177 0.649902 13.0004 0.649902 14.6506M6.87223 8.4283C9.02005 8.4283 10.7612 6.68716 10.7612 4.53935C10.7612 2.39154 9.02005 0.650391 6.87223 0.650391C4.72442 0.650391 2.98328 2.39154 2.98328 4.53935C2.98328 6.68716 4.72442 8.4283 6.87223 8.4283ZM16.2057 13.8728C16.2057 11.2517 14.6501 8.8172 13.0946 7.65051C13.6059 7.26688 14.0148 6.76312 14.285 6.18381C14.5553 5.60449 14.6785 4.9675 14.6439 4.32919C14.6093 3.69088 14.4179 3.07094 14.0866 2.52425C13.7553 1.97755 13.2944 1.52094 12.7446 1.19484" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const HomeIcon = () => (
  <svg viewBox="0 0 16 17" className="h-6 w-6" fill="none">
    <path d="M10.1499 15.6921V9.35874C10.1499 9.14877 10.0665 8.94741 9.91803 8.79894C9.76956 8.65048 9.5682 8.56707 9.35824 8.56707H6.19157C5.98161 8.56707 5.78024 8.65048 5.63178 8.79894C5.48331 8.94741 5.3999 9.14877 5.3999 9.35874V15.6921M0.649902 6.98374C0.649847 6.75342 0.700042 6.52586 0.796984 6.31693C0.893927 6.108 1.03528 5.92274 1.21119 5.77407L6.75286 1.02407C7.03864 0.78254 7.40073 0.650024 7.7749 0.650024C8.14908 0.650024 8.51116 0.78254 8.79694 1.02407L14.3386 5.77407C14.5145 5.92274 14.6559 6.108 14.7528 6.31693C14.8498 6.52586 14.9 6.75342 14.8999 6.98374V14.1087C14.8999 14.5287 14.7331 14.9314 14.4362 15.2283C14.1392 15.5253 13.7365 15.6921 13.3166 15.6921H2.23324C1.81331 15.6921 1.41058 15.5253 1.11365 15.2283C0.816717 14.9314 0.649902 14.5287 0.649902 14.1087V6.98374Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ProgressIcon = () => (
  <svg viewBox="0 0 16 16" className="h-6 w-6" fill="none">
    <path d="M0.649902 0.650024V13.3167C0.649902 13.7366 0.816717 14.1393 1.11365 14.4363C1.41058 14.7332 1.81331 14.9 2.23324 14.9H14.8999M13.3166 5.40002L9.35824 9.35836L6.19157 6.19169L3.81657 8.56669" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const LogoutIcon = () => (
  <svg viewBox="0 0 14 14" className="h-6 w-6" fill="none">
    <path d="M8.8999 0.650391L12.6499 4.40039L8.8999 8.15039M12.6499 4.40039H4.7749C3.68088 4.40039 2.63167 4.83499 1.85809 5.60857C1.0845 6.38216 0.649902 7.43137 0.649902 8.52539C0.649902 9.06709 0.756599 9.60349 0.963899 10.104C1.1712 10.6044 1.47505 11.0592 1.85809 11.4422C2.63167 12.2158 3.68088 12.6504 4.7749 12.6504H7.3999" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  if (!isAuthenticated) return null
  if (location.pathname === '/set-password') return null
  if (location.pathname.startsWith('/mood') || location.pathname.startsWith('/sessions/') || location.pathname.startsWith('/profile')) return null

  if (user?.role === 'admin') {
    const adminListPages = ['/admin/calendar', '/admin/programs', '/admin/clients']
    if (!adminListPages.includes(location.pathname)) return null
  }

  const navItems = user?.role === 'admin'
    ? [
        { path: '/admin/calendar', icon: CalendarIcon, label: 'Agenda' },
        { path: '/admin/programs', icon: ProgramsIcon, label: 'Programmes' },
        { path: '/admin/clients', icon: ClientsIcon, label: 'Clients' },
        { action: 'logout', icon: LogoutIcon, label: 'Déconnecter' }
      ]
    : [
        { path: '/', icon: HomeIcon, label: 'Accueil' },
        { path: '/agenda', icon: CalendarIcon, label: 'Agenda' },
        { path: '/progres', icon: ProgressIcon, label: 'Espace' },
        { action: 'logout', icon: LogoutIcon, label: 'Déconnecter' }
      ]

  const isActive = (path) => {
    if (path.startsWith('/admin')) {
      return location.pathname === path || location.pathname.startsWith(`${path}/`)
    }

    return location.pathname === path
  }

  const confirmLogout = () => {
    logout()
    setShowLogoutConfirm(false)
    navigate('/login')
  }

  return (
    <>
      <div className="bottom-nav-shell bottom-nav-shell-client">
        <div className="bottom-nav-inner bottom-nav-inner-client">
          {navItems.map((item) => {
            const active = item.path ? isActive(item.path) : false
            const Icon = item.icon

            if (item.action === 'logout') {
              return (
                <button
                  key={item.action}
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="nav-link"
                >
                  <Icon />
                  <span>{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${active ? 'nav-link-active' : ''}`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/35">
          <div className="w-full rounded-t-[28px] bg-brand-beige px-6 pb-10 pt-8 text-center shadow-float">
            <div className="mx-auto max-w-md">
              <h2 className="text-2xl font-light text-brand-tamarillo">
                Se déconnecter ?
              </h2>
              <p className="mx-auto mt-3 max-w-[300px] text-sm leading-5 text-brand-brown">
                Voulez-vous vraiment vous déconnecter ?
              </p>

              <button
                type="button"
                onClick={confirmLogout}
                className="mt-8 w-full rounded-md bg-brand-tamarillo px-5 py-4 text-base font-bold text-brand-beige"
              >
                Valider
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="mt-4 w-full rounded-md border border-brand-tamarillo px-5 py-4 text-base font-bold text-brand-tamarillo"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default BottomNav
