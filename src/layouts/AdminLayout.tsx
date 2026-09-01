import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { ToastHost } from '@/components/shared/ToastHost'
import { cn } from '@/utils/format'

export function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    if (!navOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [navOpen])

  return (
    <div className="flex h-screen w-full max-w-[100vw] overflow-hidden bg-slate-50">
      {navOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 h-full transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0',
          navOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <AdminSidebar onNavigate={() => setNavOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar onMenu={() => setNavOpen(true)} />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
      <ToastHost />
    </div>
  )
}
