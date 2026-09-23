import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeModal } from '@/store/slices/uiSlice'
import modalClose from '@/assets/icons/modal-close.svg'
import settledCheck from '@/assets/icons/settled-check.svg'

export function SuccessModal() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const payload = useAppSelector((s) => s.ui.modalPayload)
  const title = String(payload?.title ?? 'Success')
  const body = String(payload?.body ?? '')
  const actionLabel = String(payload?.actionLabel ?? 'Done')
  const actionTo = payload?.actionTo ? String(payload.actionTo) : undefined
  const simple = !actionTo

  if (title === 'Balance Settled') {
    return (
      <Modal title={title} chrome="none">
        <div className="overflow-hidden rounded-t-3xl bg-white shadow-[0px_24px_64px_0px_rgba(0,0,0,0.2)] sm:rounded-3xl">
          <div className="flex items-center justify-between gap-3 border-b border-[#ebebec] px-4 py-4 sm:px-6">
            <p className="min-w-0 truncate text-[14px] font-semibold leading-5 text-[#1a1e26]">Balance Settled</p>
            <button
              type="button"
              onClick={() => dispatch(closeModal())}
              className="flex size-7 shrink-0 items-center justify-center rounded-full"
              aria-label="Close"
            >
              <img src={modalClose} alt="" width={14} height={14} className="block max-w-none" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-4 px-4 py-5 sm:px-6">
            <div className="relative size-12 shrink-0 rounded-3xl bg-[#d9ffe3]">
              <img
                src={settledCheck}
                alt=""
                width={24}
                height={24}
                className="absolute top-3 left-3 block max-w-none"
              />
            </div>
            <p className="text-[13px] font-medium leading-4 text-[#46494f]">Balance Settled</p>
            <p className="w-full min-w-0 text-center text-[13px] font-normal leading-5 text-[#7a7b7c]">{body}</p>
          </div>
          <div className="flex gap-3 border-t border-[#ebebec] px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => dispatch(closeModal())}
              className="flex h-[46px] min-w-0 flex-1 items-center justify-center rounded-xl border border-[#ebebec] text-[14px] font-medium leading-5 text-[#46494f]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(closeModal())
                if (actionTo) navigate(actionTo)
              }}
              className="flex h-[46px] min-w-0 flex-1 items-center justify-center rounded-xl bg-[#34a853] text-[14px] font-semibold leading-5 text-white"
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      title={title}
      footer={
        simple ? (
          <Button
            pill
            className="w-full"
            onClick={() => {
              dispatch(closeModal())
            }}
          >
            {actionLabel}
          </Button>
        ) : (
          <div className="grid w-full grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => dispatch(closeModal())}>
              Close
            </Button>
            <Button
              onClick={() => {
                dispatch(closeModal())
                navigate(actionTo)
              }}
            >
              {actionLabel}
            </Button>
          </div>
        )
      }
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center sm:py-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dacdd0] text-2xl text-[#480516]">
          ✓
        </span>
        {simple ? (
          <p className="max-w-[320px] min-w-0 text-[14px] leading-relaxed text-[#6b7280]">{body}</p>
        ) : (
          <>
            <h3 className="text-[18px] font-semibold text-[#1a1e26]">{title}</h3>
            <p className="max-w-[320px] min-w-0 text-[14px] leading-relaxed text-[#6b7280]">{body}</p>
          </>
        )}
      </div>
    </Modal>
  )
}
