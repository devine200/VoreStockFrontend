import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Modal, ConfirmActions } from '@/components/shared/Modal'
import { SuccessModal } from '@/components/shared/SuccessModal'
import { showSuccess } from '@/store/slices/uiSlice'
import { setOfferStatus } from '@/store/slices/offersSlice'
import { SettleBalanceModal } from '@/components/bids/SettleBalanceModals'
import { AcceptOfferModal, DeclineOfferModal } from '@/components/offers/OfferActionModals'
import { useState } from 'react'
import { Field, Input } from '@/components/shared/Field'

export function ModalHost() {
  const dispatch = useAppDispatch()
  const modal = useAppSelector((s) => s.ui.modal)
  const payload = useAppSelector((s) => s.ui.modalPayload)
  const [counterAmount, setCounterAmount] = useState('')

  if (!modal) return null

  if (modal === 'accept-offer') {
    return <AcceptOfferModal />
  }

  if (modal === 'decline-offer') {
    return <DeclineOfferModal />
  }

  if (modal === 'counter-offer') {
    const id = String(payload?.id ?? '')
    return (
      <Modal
        title="Counter offer"
        footer={
          <ConfirmActions
            confirmLabel="Send counter"
            onConfirm={() => {
              const amount = Number(counterAmount)
              if (!amount) return
              dispatch(setOfferStatus({ id, status: 'countered', amount }))
              dispatch(
                showSuccess({
                  title: 'Counter Offer Sent',
                  body: 'Your counter offer has been sent to the counterparty.',
                  actionLabel: 'Done',
                }),
              )
            }}
          />
        }
      >
        <Field label="Counter offer amount (US$)">
          <Input
            type="number"
            value={counterAmount}
            onChange={(e) => setCounterAmount(e.target.value)}
            placeholder="e.g. 48000"
          />
        </Field>
      </Modal>
    )
  }

  if (modal === 'settle-balance') {
    return <SettleBalanceModal />
  }

  if (modal === 'success') {
    return <SuccessModal />
  }

  return null
}
