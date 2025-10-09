import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from './store/hooks'
import { setCredentials } from './store/slices/authSlice'
import { useWebSocket } from './hooks/useWebSocket'
import { authService } from './services/auth.service'

// Pages
import LoginPage from './pages/auth/Login'
import RegisterPage from './pages/auth/Register'
import AccountActivationPage from './pages/auth/AccountActivation'
import DashboardPage from './pages/dashboard/Dashboard'
import ProjectsPage from './pages/projects/Projects'
import TasksPage from './pages/tasks/Tasks'
import ProfilePage from './pages/profile/Profile'
import NotFound from './pages/NotFound'

// Components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  
  // Initialiser WebSocket
  useWebSocket()

  // Vérifier le token au démarrage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token')
      
      if (storedToken && !isAuthenticated) {
        try {
          const user = await authService.getCurrentUser()
          dispatch(setCredentials({ user, token: storedToken }))
        } catch (error) {
          localStorage.removeItem('token')
          console.error('Token validation failed:', error)
        }
      }
    }

    initializeAuth()
  }, [dispatch, isAuthenticated])

  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        } />
        <Route path="/account-activation" element={<AccountActivationPage />} />

        {/* Routes privées */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Route 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App