import { FormEvent, useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Field, Input, Textarea } from '@/components/shared/Field'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { openDispute } from '@/store/slices/accountSlices'
import { showSuccess } from '@/store/slices/uiSlice'
import type { Order } from '@/types'

export function OpenDisputeForm() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector((s) => s.orders.items)
  const [orderId, setOrderId] = useState('')
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [error, setError] = useState('')

  const reset = () => {
    setOrderId('')
    setReason('')
    setDetails('')
    setError('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const order = orders.find((o) => o.id.toLowerCase() === orderId.trim().toLowerCase())
    if (!order) {
      setError('Enter a valid order ID from your orders.')
      return
    }
    dispatch(
      openDispute({
        orderId: order.id,
        lotId: order.lotId,
        reason: reason.trim(),
        details: details.trim(),
        amount: order.amount,
      }),
    )
    dispatch(
      showSuccess({
        title: 'Dispute Submitted',
        body: 'Your Dispute has been Submitted.',
        actionLabel: 'Done',
      }),
    )
    reset()
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[#ebebec] bg-white p-5">
      <h2 className="text-[14px] font-semibold leading-5 text-[#1a1e26]">Open a new dispute</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-4">
        <Field label="Related order" className="text-[12px] [&_span]:font-medium [&_span]:text-[#46494f]">
          <Input
            list="dispute-order-ids"
            value={orderId}
            onChange={(e) => {
              setOrderId(e.target.value)
              setError('')
            }}
            placeholder="e.g. ORD-3402"
            required
            className="h-[42px] rounded-xl px-3.5 text-[14px]"
          />
          <datalist id="dispute-order-ids">
            {orders.map((order: Order) => (
              <option key={order.id} value={order.id} />
            ))}
          </datalist>
        </Field>
        <Field label="Dispute reason" className="text-[12px] [&_span]:font-medium [&_span]:text-[#46494f]">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Item not as described"
            required
            className="h-[42px] rounded-xl px-3.5 text-[14px]"
          />
        </Field>
      </div>
      <Field label="Describe the issue" className="mt-5 text-[12px] [&_span]:font-medium [&_span]:text-[#46494f]">
        <Textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Provide as much detail as possible…"
          className="min-h-[86px] rounded-xl px-3.5 py-3 text-[14px]"
          required
        />
      </Field>
      {error ? <p className="mt-2 text-[13px] text-accent-red">{error}</p> : null}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button type="submit" className="h-[42px] px-6 text-[14px] font-semibold !bg-[#480516]">
          Submit dispute
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-[42px] px-6 text-[14px] font-medium text-[#7a7b7c]"
          onClick={reset}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
