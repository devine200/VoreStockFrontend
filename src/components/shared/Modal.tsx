import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'
import { useAppDispatch } from '@/store/hooks'
import { closeModal } from '@/store/slices/uiSlice'
import { cn } from '@/utils/format'

export function Modal({
  title,
  children,
  onClose,
  footer,
  wide,
  chrome = 'default',
}: {
  title?: string
  children: ReactNode
  onClose?: () => void
  footer?: ReactNode
  wide?: boolean
  chrome?: 'default' | 'none'
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
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6 animate-fade-in">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 bg-ink/40"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-label={title}
        className={
          chrome === 'none'
            ? 'relative z-10 w-full max-w-[420px] animate-scale-in sm:px-0'
            : cn(
                'relative z-10 flex w-full max-h-[min(92dvh,720px)] flex-col overflow-hidden rounded-t-3xl border border-border bg-white shadow-[0px_10px_20px_rgba(72,5,22,0.12)] animate-scale-in sm:rounded-3xl',
                wide ? 'max-w-lg' : 'max-w-[420px]',
              )
        }
      >
        {chrome === 'none' ? (
          children
        ) : (
          <>
            <div className="flex shrink-0 items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
              <h2 className="min-w-0 text-[20px] font-semibold leading-7 tracking-tight text-neutral-500 sm:text-2xl">
                {title}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="shrink-0 rounded-md p-1 text-ink-muted hover:bg-surface"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm text-ink-muted sm:px-6">
              {children}
            </div>
            {footer ? (
              <div className="shrink-0 border-t border-[#ebebec] px-5 py-4 sm:px-6">
                <div className="flex w-full flex-col-reverse gap-3 [&>button]:w-full sm:flex-row sm:justify-end sm:[&>button]:w-auto">
                  {footer}
                </div>
              </div>
            ) : null}
          </>
        )}
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
