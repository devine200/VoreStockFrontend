import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeModal } from '@/store/slices/uiSlice'

export function SuccessModal() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const payload = useAppSelector((s) => s.ui.modalPayload)
  const title = String(payload?.title ?? 'Success')
  const body = String(payload?.body ?? '')
  const actionLabel = String(payload?.actionLabel ?? 'Done')
  const actionTo = payload?.actionTo ? String(payload.actionTo) : undefined
  const simple = !actionTo

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
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dacdd0] text-2xl text-[#480516]">
          ✓
        </span>
        {simple ? (
          <p className="max-w-[320px] text-[14px] leading-relaxed text-[#6b7280]">{body}</p>
        ) : (
          <>
            <h3 className="text-[18px] font-semibold text-[#1a1e26]">{title}</h3>
            <p className="max-w-[320px] text-[14px] leading-relaxed text-[#6b7280]">{body}</p>
          </>
        )}
      </div>
    </Modal>
  )
}
