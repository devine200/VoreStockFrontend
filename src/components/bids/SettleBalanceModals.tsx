import { useMemo, useState } from 'react'
import { getLot } from '@/api/fixtures'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeModal, showSuccess } from '@/store/slices/uiSlice'
import { settleWonBid } from '@/store/slices/bidsSlice'
import { holdEscrow } from '@/store/slices/walletSlice'
import { addOrderFromWin } from '@/store/slices/accountSlices'
import { formatMoney } from '@/utils/format'
import { useCountdown } from '@/hooks/useCountdown'

function lotCode(lotId: string) {
  const n = Number(lotId.replace(/\D/g, '')) || 0
  return `LOT-${4700 + n}`
}

function breakdown(finalBid: number) {
  const freight = Math.round(finalBid * 0.15)
  const duty = Math.round(finalBid * 0.1)
  const vat = Math.round(finalBid * 0.075)
  const fee = Math.round(finalBid * 0.02)
  const landed = finalBid + freight + duty + vat + fee
  const deposit = duty
  const due = landed - deposit
  return { finalBid, freight, duty, vat, fee, landed, deposit, due }
}

export function SettleBalanceModal() {
  const dispatch = useAppDispatch()
  const payload = useAppSelector((s) => s.ui.modalPayload)
  const [confirmed, setConfirmed] = useState(false)

  const bidId = String(payload?.bidId ?? '')
  const lotId = String(payload?.lotId ?? '')
  const amount = Number(payload?.amount ?? 0)
  const settlementDueAt = String(payload?.settlementDueAt ?? new Date(Date.now() + 11.7 * 3600000).toISOString())
  const lot = getLot(lotId)
  const due = useCountdown(settlementDueAt)
  const lines = useMemo(() => breakdown(amount), [amount])

  const dueLabel = due.expired
    ? 'Past due'
    : `${due.days * 24 + due.hours}h : ${String(due.minutes).padStart(2, '0')}m : ${String(due.seconds).padStart(2, '0')}s`

  const rows: { label: string; value: string; muted?: boolean }[] = [
    { label: 'Final Bid', value: formatMoney(lines.finalBid) },
    { label: 'Freight & Logistics', value: formatMoney(lines.freight) },
    { label: 'Import Duty', value: formatMoney(lines.duty) },
    { label: 'VAT', value: formatMoney(lines.vat) },
    { label: 'Platform fee', value: formatMoney(lines.fee) },
  ]

  return (
    <Modal
      title="Settle Balance"
      wide
      footer={
        <div className="grid w-full grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => dispatch(closeModal())}>
            Cancel
          </Button>
          <Button
            disabled={!confirmed}
            onClick={() => {
              const orderId = `ORD-${8800 + Math.floor(Math.random() * 90)}`
              dispatch(settleWonBid(bidId))
              dispatch(holdEscrow({ amount: lines.deposit, label: `Escrow · ${lot?.title ?? lotId}` }))
              dispatch(addOrderFromWin({ lotId, amount: lines.due }))
              dispatch(
                showSuccess({
                  title: 'Balance Settled',
                  body: `${formatMoney(lines.due)} moved to escrow for ${lot ? lotCode(lot.id) : lotCode(lotId)}. Order ${orderId} created and the seller has been notified to release goods.`,
                  actionLabel: 'View Order',
                  actionTo: '/orders',
                }),
              )
            }}
          >
            Pay {formatMoney(lines.due)}
          </Button>
        </div>
      }
    >
      <div className="-mx-1 space-y-4 text-[#1a1e26]">
        {lot ? (
          <div className="flex gap-3 rounded-xl bg-[#f5f5f6] p-3">
            <img src={lot.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-snug text-[#1a1e26]">{lot.title}</p>
              <p className="mt-1 text-[13px] text-[#7a7b7c]">Current bid: {formatMoney(lot.currentBid)}</p>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl bg-[#fdebec] px-4 py-3 text-center text-[14px] font-semibold text-[#c62828]">
          Settlement Due in {dueLabel}
        </div>

        <div className="space-y-2.5 text-[14px]">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4">
              <span className="text-[#4b5563]">{row.label}</span>
              <span className="font-medium tabular-nums text-[#1a1e26]">{row.value}</span>
            </div>
          ))}
          <div className="border-t border-[#ebebec] pt-2.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#4b5563]">Landed Total</span>
              <span className="font-semibold tabular-nums">{formatMoney(lines.landed)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-[#4b5563]">Deposit already held</span>
              <span className="font-medium tabular-nums">-{formatMoney(lines.deposit)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[#ebebec] pt-2.5">
            <span className="font-semibold text-[#1a1e26]">Amount Due Now</span>
            <span className="text-[16px] font-semibold tabular-nums text-[#1a1e26]">
              {formatMoney(lines.due)}
            </span>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#d1d5db] accent-[#480516]"
          />
          <span className="text-[12px] leading-snug text-[#9ca3af]">
            I confirm that the landed cost break down and agree funds are released to the seller after delivery
          </span>
        </label>
      </div>
    </Modal>
  )
}
