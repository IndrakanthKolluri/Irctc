import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/authContext.js'

// Redirect signed-out users and accounts without the required role.
export default function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext)
  const location = useLocation()

  if (!user) {
    return <Navigate to={role === 'admin' ? '/admin-login' : '/login'} replace state={{ from: location.pathname }} />
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/user/home'} replace />
  }
  return children
}
