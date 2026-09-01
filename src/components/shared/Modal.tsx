import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'
import { useAppDispatch } from '@/store/hooks'
import { closeModal } from '@/store/slices/uiSlice'

export function Modal({
  title,
  children,
  onClose,
  footer,
  wide,
}: {
  title: string
  children: ReactNode
  onClose?: () => void
  footer?: ReactNode
  wide?: boolean
}) {
  const dispatch = useAppDispatch()
  const handleClose = onClose ?? (() => dispatch(closeModal()))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [])

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center sm:p-6 animate-fade-in">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 bg-ink/40"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal
        className={`relative z-10 w-full ${wide ? 'max-w-lg' : 'max-w-[420px]'} max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-white p-5 shadow-[0px_10px_20px_rgba(72,5,22,0.12)] animate-scale-in sm:p-6`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-500">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-ink-muted hover:bg-surface"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="text-sm text-ink-muted">{children}</div>
        {footer ? <div className="mt-6 flex w-full justify-end gap-3">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

export function ConfirmActions({
  cancelLabel = 'Cancel',
  confirmLabel,
  onConfirm,
  danger,
}: {
  cancelLabel?: string
  confirmLabel: string
  onConfirm: () => void
  danger?: boolean
}) {
  const dispatch = useAppDispatch()
  return (
    <>
      <Button variant="secondary" onClick={() => dispatch(closeModal())}>
        {cancelLabel}
      </Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </>
  )
}
