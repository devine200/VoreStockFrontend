import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearToast } from '@/store/slices/uiSlice'

export function ToastHost() {
  const toast = useAppSelector((s) => s.ui.toast)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => dispatch(clearToast()), 2800)
    return () => window.clearTimeout(id)
  }, [toast, dispatch])

  if (!toast) return null

  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-lg animate-slide-up sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-sm">
      {toast}
    </div>
  )
}
