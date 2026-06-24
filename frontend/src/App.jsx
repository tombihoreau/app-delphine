import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import SetPasswordPage from './pages/SetPasswordPage'
import CoachProgramsPage from './pages/CoachProgramsPage'
import CoachProgramCreatePage from './pages/CoachProgramCreatePage'
import CoachProgramEditPage from './pages/CoachProgramEditPage'
import CoachProgramDetailPage from './pages/CoachProgramDetailPage'
import CoachClientsPage from './pages/CoachClientsPage'
import CoachCalendarPage from './pages/CoachCalendarPage'
import CoachClientCreatePage from './pages/CoachClientCreatePage'
import CoachClientEditPage from './pages/CoachClientEditPage'
import CoachClientDetailPage from './pages/CoachClientDetailPage'
import CoachClientHistoryPage from './pages/CoachClientHistoryPage'
import CoachAssignSessionPage from './pages/CoachAssignSessionPage'
import CoachProgramAssignPage from './pages/CoachProgramAssignPage'
import CoachSessionPage from './pages/CoachSessionPage'
import ClientAgendaPage from './pages/ClientAgendaPage'
import ClientProgressPage from './pages/ClientProgressPage'
import ClientProfileEditPage from './pages/ClientProfileEditPage'
import ClientMoodPage from './pages/ClientMoodPage'
import ClientDailyStatePage from './pages/ClientDailyStatePage'
import ClientSessionPage from './pages/ClientSessionPage'
import BottomNav from './components/BottomNav'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  if (!isAuthenticated) return <Navigate to="/login" />
  if (user?.role !== 'admin') return <Navigate to="/" />
  return children
}

const ClientRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  if (!isAuthenticated) return <Navigate to="/login" />
  if (user?.role === 'admin') return <Navigate to="/admin/programs" />
  return children
}

function App() {
  return (
    <div className="min-h-screen bg-dark text-ink">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Navigate to="/login" />} />
        <Route path="/" element={<ClientRoute><DashboardPage /></ClientRoute>} />
        <Route path="/agenda" element={<ClientRoute><ClientAgendaPage /></ClientRoute>} />
        <Route path="/progres" element={<ClientRoute><ClientProgressPage /></ClientRoute>} />
        <Route path="/profile/edit" element={<ClientRoute><ClientProfileEditPage /></ClientRoute>} />
        <Route path="/mood" element={<ClientRoute><ClientMoodPage /></ClientRoute>} />
        <Route path="/mood/details" element={<ClientRoute><ClientDailyStatePage /></ClientRoute>} />
        <Route path="/sessions/:id" element={<ClientRoute><ClientSessionPage /></ClientRoute>} />
        <Route path="/admin-root" element={<ProtectedRoute><Navigate to="/admin/programs" replace /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/programs" element={<AdminRoute><CoachProgramsPage /></AdminRoute>} />
        <Route path="/admin/programs/new" element={<AdminRoute><CoachProgramCreatePage /></AdminRoute>} />
        <Route path="/admin/programs/:programId/edit" element={<AdminRoute><CoachProgramEditPage /></AdminRoute>} />
        <Route path="/admin/programs/:programId/assign" element={<AdminRoute><CoachProgramAssignPage /></AdminRoute>} />
        <Route path="/admin/programs/:programId" element={<AdminRoute><CoachProgramDetailPage /></AdminRoute>} />
        <Route path="/admin/clients" element={<AdminRoute><CoachClientsPage /></AdminRoute>} />
        <Route path="/admin/clients/new" element={<AdminRoute><CoachClientCreatePage /></AdminRoute>} />
        <Route path="/admin/clients/:id/edit" element={<AdminRoute><CoachClientEditPage /></AdminRoute>} />
        <Route path="/admin/clients/:id/history" element={<AdminRoute><CoachClientHistoryPage /></AdminRoute>} />
        <Route path="/admin/clients/:id" element={<AdminRoute><CoachClientDetailPage /></AdminRoute>} />
        <Route path="/admin/clients/:id/assign" element={<AdminRoute><CoachAssignSessionPage /></AdminRoute>} />
        <Route path="/admin/calendar" element={<AdminRoute><CoachCalendarPage /></AdminRoute>} />
        <Route path="/admin/sessions/:id" element={<AdminRoute><CoachSessionPage /></AdminRoute>} />
        <Route path="/set-password" element={<ProtectedRoute><SetPasswordPage /></ProtectedRoute>} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default App
