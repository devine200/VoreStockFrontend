import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Modal } from '@/components/shared/Modal'
import { closeModal, showSuccess } from '@/store/slices/uiSlice'
import { setOfferStatus } from '@/store/slices/offersSlice'

export function AcceptOfferModal() {
  const dispatch = useAppDispatch()
  const id = String(useAppSelector((s) => s.ui.modalPayload)?.id ?? '')

  return (
    <Modal title="Accept Offer" chrome="none">
      <div className="overflow-hidden rounded-t-3xl border border-[#ebebec] bg-white shadow-[0px_10px_20px_rgba(72,5,22,0.12)] sm:rounded-2xl">
        <div className="flex flex-col items-center gap-3 px-6 pb-5 pt-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#e6f4ed] text-[22px] font-semibold text-[#0a6e38]">
            ?
          </span>
          <h3 className="text-[14px] font-semibold leading-5 text-[#1a1e26]">Accept this offer?</h3>
          <p className="max-w-[320px] text-[14px] leading-relaxed text-[#9d9ea2]">
            Are you sure you want to accept this offer? This will mark the offer as accepted.
          </p>
        </div>
        <div className="grid grid-cols-[161fr_199fr] gap-3 px-6 pb-6">
          <button
            type="button"
            className="h-[46px] rounded-xl border border-[#ebebec] text-[14px] font-medium text-[#46494f]"
            onClick={() => dispatch(closeModal())}
          >
            Cancel
          </button>
          <button
            type="button"
            className="h-[46px] rounded-xl bg-[#0a6e38] text-[14px] font-semibold text-white hover:bg-[#085c2f]"
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
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function DeclineOfferModal() {
  const dispatch = useAppDispatch()
  const id = String(useAppSelector((s) => s.ui.modalPayload)?.id ?? '')

  return (
    <Modal title="Decline Offer" chrome="none">
      <div className="overflow-hidden rounded-t-3xl border border-[#ebebec] bg-white shadow-[0px_10px_20px_rgba(72,5,22,0.12)] sm:rounded-2xl">
        <div className="flex flex-col items-center gap-3 px-6 pb-5 pt-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#fff1f1]">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#ff383c] text-[11px] font-bold text-white">
              ✕
            </span>
          </span>
          <h3 className="text-[14px] font-semibold leading-5 text-[#1a1e26]">Decline this offer?</h3>
          <p className="max-w-[320px] text-[14px] leading-relaxed text-[#9d9ea2]">
            Are you sure you want to decline this offer? This will mark the offer as declined.
          </p>
        </div>
        <div className="grid grid-cols-[161fr_199fr] gap-3 px-6 pb-6">
          <button
            type="button"
            className="h-[46px] rounded-xl border border-[#ebebec] text-[14px] font-medium text-[#46494f]"
            onClick={() => dispatch(closeModal())}
          >
            Cancel
          </button>
          <button
            type="button"
            className="h-[46px] rounded-xl bg-[#ff383c] text-[14px] font-semibold text-white hover:opacity-90"
            onClick={() => {
              dispatch(setOfferStatus({ id, status: 'declined' }))
              dispatch(closeModal())
            }}
          >
            Decline offer
          </button>
        </div>
      </div>
    </Modal>
  )
}
