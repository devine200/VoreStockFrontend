import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { closeModal, showSuccess } from '@/store/slices/uiSlice'
import { setOfferStatus } from '@/store/slices/offersSlice'

export function AcceptOfferModal() {
  const dispatch = useAppDispatch()
  const id = String(useAppSelector((s) => s.ui.modalPayload)?.id ?? '')

  return (
    <Modal
      title="Accept Offer"
      footer={
        <div className="grid w-full grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => dispatch(closeModal())}>
            Cancel
          </Button>
          <Button
            className="!bg-[#0e603c] hover:!bg-[#0a4d30]"
            onClick={() => {
              dispatch(setOfferStatus({ id, status: 'accepted' }))
              dispatch(
                showSuccess({
                  title: 'Offer Accepted',
                  body: 'The offer is now binding. The seller has 48 hours to complete settlement docs.',
                  actionLabel: 'Done',
                }),
              )
            }}
          >
            Accept offer
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f6ee] text-2xl font-semibold text-[#0e603c]">
          ?
        </span>
        <h3 className="text-[18px] font-semibold text-[#1a1e26]">Accept this offer?</h3>
        <p className="max-w-[320px] text-[14px] leading-relaxed text-[#6b7280]">
          Are you sure you want to accept this offer? This will mark the offer as accepted.
        </p>
      </div>
    </Modal>
  )
}

export function DeclineOfferModal() {
  const dispatch = useAppDispatch()
  const id = String(useAppSelector((s) => s.ui.modalPayload)?.id ?? '')

  return (
    <Modal
      title="Decline Offer"
      footer={
        <div className="grid w-full grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => dispatch(closeModal())}>
            Cancel
          </Button>
          <Button
            className="!bg-[#ff383c] hover:opacity-90"
            onClick={() => {
              dispatch(setOfferStatus({ id, status: 'declined' }))
              dispatch(closeModal())
            }}
          >
            Decline offer
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fdebec]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff383c] text-sm font-bold text-white">
            ✕
          </span>
        </span>
        <h3 className="text-[18px] font-semibold text-[#1a1e26]">Decline this offer?</h3>
        <p className="max-w-[320px] text-[14px] leading-relaxed text-[#6b7280]">
          Are you sure you want to decline this offer? This will mark the offer as declined and notify the
          counterparty.
        </p>
      </div>
    </Modal>
  )
}
