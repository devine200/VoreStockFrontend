import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { ToastHost } from '@/components/shared/ToastHost'
import { adminLogo } from '@/assets/admin'
import { cn } from '@/utils/format'

export function AdminAuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-maroon-950 px-5 py-4">
        <div className="mx-auto flex w-full max-w-[440px] items-center gap-2.5">
          <div className="h-7 w-[41px] shrink-0 overflow-hidden">
            <img src={adminLogo} alt="VSK" className="h-7 w-[41px] object-cover" />
          </div>
          <p className="text-[13px] text-slate-400">Admin</p>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[440px] animate-slide-up">
          <Outlet />
        </div>
      </div>
      <ToastHost />
    </div>
  )
}

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
        <main
          id="admin-main"
          className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 px-3.5 py-3.5 sm:p-5 lg:p-6"
        >
          <Outlet />
        </main>
      </div>
      <ToastHost />
    </div>
  )
}
