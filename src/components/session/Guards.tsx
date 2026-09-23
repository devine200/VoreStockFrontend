import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

export function AuthGuard() {
  const user = useAppSelector((s) => s.session.user)
  const location = useLocation()
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    )
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
        to="/admin/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}

export function AdminGuestGuard() {
  const user = useAppSelector((s) => s.session.user)
  const location = useLocation()
  if (user?.role === 'admin') {
    const from = (location.state as { from?: string } | null)?.from
    const dest = from && from.startsWith('/admin') && from !== '/admin/login' ? from : '/admin'
    return <Navigate to={dest} replace />
  }
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
