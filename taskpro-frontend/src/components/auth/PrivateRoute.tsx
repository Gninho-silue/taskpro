import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import LoadingSpinner from '../ui/LoadingSpinner'

const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  if (isLoading) {
    return <LoadingSpinner />
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default PrivateRoute
