import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

export function AuthGuard() {
  const user = useAppSelector((s) => s.session.user)
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function GuestGuard() {
  const user = useAppSelector((s) => s.session.user)
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  return <Outlet />
}

export function AdminGuard() {
  const user = useAppSelector((s) => s.session.user)
  const location = useLocation()
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}
