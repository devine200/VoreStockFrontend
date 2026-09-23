import { useMemo, useState } from 'react'
import { getLot } from '@/api/fixtures'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeModal, showSuccess } from '@/store/slices/uiSlice'
import { settleWonBid } from '@/store/slices/bidsSlice'
import { holdEscrow } from '@/store/slices/walletSlice'
import { addOrderFromWin } from '@/store/slices/accountSlices'
import { applyFreightCredit } from '@/store/slices/referralsSlice'
import { formatMoney } from '@/utils/format'
import { useCountdown } from '@/hooks/useCountdown'
import modalClose from '@/assets/icons/modal-close.svg'

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

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] leading-[16.5px] text-[#46494f]">{label}</span>
      <span className="text-[12px] font-medium leading-4 tabular-nums text-[#46494f]">{value}</span>
    </div>
  )
}

export function SettleBalanceModal() {
  const dispatch = useAppDispatch()
  const payload = useAppSelector((s) => s.ui.modalPayload)
  const freightCredits = useAppSelector((s) => s.referrals.available)
  const [confirmed, setConfirmed] = useState(false)
  const [applyBonus, setApplyBonus] = useState(false)

  const bidId = String(payload?.bidId ?? '')
  const lotId = String(payload?.lotId ?? '')
  const amount = Number(payload?.amount ?? 0)
  const settlementDueAt = String(payload?.settlementDueAt ?? new Date(Date.now() + 11.7 * 3600000).toISOString())
  const lot = getLot(lotId)
  const due = useCountdown(settlementDueAt)
  const lines = useMemo(() => breakdown(amount), [amount])
  const freightBonus = applyBonus ? Math.min(freightCredits, lines.freight, lines.due) : 0
  const amountDue = lines.due - freightBonus

  const dueLabel = due.expired
    ? 'Past due'
    : `${due.days * 24 + due.hours}h : ${String(due.minutes).padStart(2, '0')}m : ${String(due.seconds).padStart(2, '0')}s`

  return (
    <Modal
      chrome="none"
      onClose={() => dispatch(closeModal())}
    >
      <div className="overflow-hidden rounded-[24px] border border-[#ebebec] bg-white shadow-[0px_24px_64px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between border-b border-[#ebebec] px-6 py-4">
          <h2 className="text-[14px] font-semibold leading-5 text-[#1a1e26]">Settle Balance</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => dispatch(closeModal())}
            className="flex size-7 items-center justify-center rounded-full hover:bg-[#f5f5f6]"
          >
            <img src={modalClose} alt="" width={14} height={14} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {lot ? (
            <div className="flex gap-3 rounded-2xl border border-[#ebebec] bg-[#f5f5f6] p-3.5">
              <img src={lot.image} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="line-clamp-2 text-[12px] font-semibold leading-[16.5px] text-[#1a1e26]">{lot.title}</p>
                <p className="mt-0.5 text-[10px] leading-[15px] text-[#7a7b7c]">
                  Current bid: US{formatMoney(amount)}
                </p>
              </div>
            </div>
          ) : null}

          <div className="rounded-xl bg-[#ffe0de] px-4 py-4 text-[14px] font-semibold leading-[16.5px] text-[#ea4335]">
            Settlement Due in {dueLabel}
          </div>

          <div className="space-y-2 border-b border-[#ebebec] pb-4">
            <Line label="Final Bid" value={formatMoney(lines.finalBid)} />
            <Line label="Freight & Logistics" value={formatMoney(lines.freight)} />
            <Line label="Import Duty" value={formatMoney(lines.duty)} />
            <Line label="VAT" value={formatMoney(lines.vat)} />
            <Line label="Platform fee" value={formatMoney(lines.fee)} />
          </div>

          <div className="space-y-2 border-b border-[#ebebec] pb-4">
            <Line label="Landed Total" value={formatMoney(lines.landed)} />
            <Line label="Deposit already held" value={`-${formatMoney(lines.deposit)}`} />
            {freightBonus > 0 ? (
              <Line label="Freight bonus" value={`-${formatMoney(freightBonus)}`} />
            ) : null}
          </div>

          <Line label="Amount Due Now" value={formatMoney(amountDue)} />

          {freightCredits > 0 ? (
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={applyBonus}
                onChange={(e) => setApplyBonus(e.target.checked)}
                className="mt-0.5 size-4 rounded-full border-[#d1d5db] accent-[#480516]"
              />
              <span className="text-[11px] leading-[17.875px] text-[#9d9ea2]">
                Apply freight bonus ({formatMoney(Math.min(freightCredits, lines.freight))} available)
              </span>
            </label>
          ) : null}

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 size-4 rounded-full border-[#d1d5db] accent-[#480516]"
            />
            <span className="text-[11px] leading-[17.875px] text-[#9d9ea2]">
              I confirm that the landed cost break down and agree funds are released to the seller after delivery
            </span>
          </label>
        </div>

        <div className="flex gap-3 border-t border-[#ebebec] px-6 py-4">
          <Button
            variant="secondary"
            className="h-[47px] flex-1 rounded-xl text-[14px] font-medium"
            onClick={() => dispatch(closeModal())}
          >
            Cancel
          </Button>
          <Button
            disabled={!confirmed}
            className="h-[47px] flex-1 rounded-xl text-[14px] font-semibold"
            onClick={() => {
              const orderId = `ORD-${8800 + Math.floor(Math.random() * 90)}`
              if (freightBonus > 0) dispatch(applyFreightCredit({ amount: freightBonus }))
              dispatch(settleWonBid(bidId))
              dispatch(holdEscrow({ amount: lines.deposit, label: `Escrow · ${lot?.title ?? lotId}` }))
              dispatch(addOrderFromWin({ lotId, amount: amountDue }))
              const bonusNote =
                freightBonus > 0 ? ` A freight bonus of ${formatMoney(freightBonus)} was applied.` : ''
              dispatch(
                showSuccess({
                  title: 'Balance Settled',
                  body: `${formatMoney(amountDue)} moved to escrow for ${lot?.title ?? lotId}. Order ${orderId} created and the seller has been notified to release goods.${bonusNote}`,
                  actionLabel: 'View Order',
                  actionTo: '/orders',
                }),
              )
            }}
          >
            Pay {formatMoney(amountDue)}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
