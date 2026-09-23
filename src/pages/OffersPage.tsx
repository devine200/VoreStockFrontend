import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { getLot } from '@/api/fixtures'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/PageChrome'
import { Icon } from '@/components/shared/Icon'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { openModal, showSuccess, showToast } from '@/store/slices/uiSlice'
import { setOfferStatus } from '@/store/slices/offersSlice'
import { cn, formatMoney } from '@/utils/format'
import type { Offer, OfferStatus } from '@/types'
import { icons } from '@/assets'

type FilterId = 'all' | 'received' | 'sent' | OfferStatus

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'received', label: 'Received' },
  { id: 'sent', label: 'Sent' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'declined', label: 'Declined' },
  { id: 'expired', label: 'Expired' },
]

const STATUS_LABEL: Record<OfferStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  countered: 'Countered',
  expired: 'Expired',
}

function lotCode(lotId: string) {
  const n = Number(lotId.replace(/\D/g, '')) || 0
  return `LOT-${4700 + n}`
}

function formatOfferDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

function statusStyle(status: OfferStatus) {
  switch (status) {
    case 'pending':
      return 'bg-[#fef3c7] text-[#92400e]'
    case 'accepted':
      return 'bg-[#e6f4ed] text-[#0a6e38]'
    case 'declined':
      return 'bg-[#fff1f1] text-[#e03030]'
    case 'countered':
      return 'bg-[#e8f0fb] text-[#1a4e8c]'
    case 'expired':
      return 'bg-[#f3f4f6] text-[#6b7280]'
    default:
      return 'bg-[#f3f4f6] text-[#6b7280]'
  }
}

function StatusPill({ status }: { status: OfferStatus }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-[16.5px]',
        statusStyle(status),
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

function DirectionPill({ direction }: { direction: Offer['direction'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-[15px]',
        direction === 'received'
          ? 'border-[#dacdd0] bg-[#f9f5f6] text-[#480516]'
          : 'border-[#ebebec] bg-[#f5f5f6] text-[#7a7b7c]',
      )}
    >
      {direction === 'received' ? 'Received' : 'Sent'}
    </span>
  )
}

function offerDelta(offer: Offer) {
  const diff = offer.amount - offer.listPrice
  const pctOfList = offer.listPrice ? Math.round((offer.amount / offer.listPrice) * 100) : 0
  const offPct = offer.listPrice ? Math.round((Math.abs(diff) / offer.listPrice) * 100) : 0
  return { diff, pctOfList, offPct }
}

function OfferRow({
  offer,
  active,
  onSelect,
}: {
  offer: Offer
  active: boolean
  onSelect: () => void
}) {
  const lot = getLot(offer.lotId)
  const { diff, pctOfList } = offerDelta(offer)
  const sign = diff >= 0 ? '+' : '−'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full min-w-0 flex-col gap-3.5 px-4 py-4 text-left transition sm:px-5 lg:flex-row lg:items-center lg:gap-4',
        active
          ? 'rounded-xl border border-[#480516] border-l-[3px] bg-[#fdfbfb]'
          : 'border-b border-[#ebebec] last:border-b-0 hover:bg-[#f9fafb] lg:border-b-0 lg:border-l-[3px] lg:border-transparent',
      )}
    >
      <div className="flex min-w-0 flex-1 gap-3 lg:gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#ebebec] bg-[#f5f5f6] lg:size-12">
          <img src={lot?.image} alt="" className="size-10 object-contain lg:size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate text-[14px] font-medium leading-5 text-[#1a1e26]">
              {lot?.title ?? offer.lotId}
            </p>
            <span className="shrink-0 lg:hidden">
              <StatusPill status={offer.status} />
            </span>
          </div>
          <p className="mt-0.5 truncate text-[12px] text-[#9ca3af] lg:hidden">
            {lotCode(offer.lotId)} · {offer.direction === 'received' ? 'Received' : 'Sent'} · {offer.counterparty}
          </p>
          <div className="hidden pt-0.5 lg:block">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <span className="font-mono text-[10px] leading-[15px] text-[#9d9ea2]">{lotCode(offer.lotId)}</span>
              {offer.direction === 'sent' ? <DirectionPill direction={offer.direction} /> : null}
            </div>
            {offer.direction === 'received' ? (
              <div className="mt-2">
                <DirectionPill direction={offer.direction} />
              </div>
            ) : null}
            <p className="mt-2 truncate text-[11px] leading-[16.5px] text-[#7a7b7c]">{offer.counterparty}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-xl bg-[#f8f8f9] text-center lg:hidden">
        <div className="px-2 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.4px] text-[#9ca3af]">Offer</p>
          <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-[#1a1e26]">{formatMoney(offer.amount)}</p>
        </div>
        <div className="border-l border-[#ebebec] px-2 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.4px] text-[#9ca3af]">vs list</p>
          <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-[#1a1e26]">
            {sign}
            {formatMoney(Math.abs(diff))}
          </p>
          <p className="text-[10px] text-[#7a7b7c]">{pctOfList}%</p>
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-3 lg:flex">
        <div className="text-right">
          <p className="text-[14px] font-semibold leading-5 tabular-nums text-[#1a1e26]">{formatMoney(offer.amount)}</p>
          <p className="mt-0.5 text-[10px] leading-[15px] text-[#7a7b7c]">
            {pctOfList}% of list · {sign}
            {formatMoney(Math.abs(diff))}
          </p>
        </div>
        <StatusPill status={offer.status} />
      </div>
    </button>
  )
}

function OfferActions({
  offer,
  lotSlug,
  counterOpen,
  counterAmount,
  onCounterAmount,
  onToggleCounter,
  onSendCounter,
}: {
  offer: Offer
  lotSlug: string
  counterOpen: boolean
  counterAmount: string
  onCounterAmount: (v: string) => void
  onToggleCounter: () => void
  onSendCounter: () => void
}) {
  const dispatch = useAppDispatch()
  const canAct = offer.status === 'pending' && offer.direction === 'received'

  return (
    <div className="space-y-3">
      {canAct && counterOpen ? (
        <div className="space-y-3">
          <p className="text-[12px] font-medium leading-4 text-[#46494f]">Counter offer amount (US$)</p>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
            <label className="flex h-[42px] min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#ebebec] bg-white px-3.5">
              <span className="shrink-0 text-[12px] leading-4 text-[#9d9ea2]">US$</span>
              <input
                type="number"
                value={counterAmount}
                onChange={(e) => onCounterAmount(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#1a1e26] outline-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
              <Button size="sm" className="h-[42px] px-4 !bg-[#480516] text-[14px] font-semibold hover:!bg-[#5a0a1c]" onClick={onSendCounter}>
                Send counter
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-[42px] px-3 text-[14px] font-normal text-[#7a7b7c]"
                onClick={onToggleCounter}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={cn('flex flex-col gap-2', canAct ? 'lg:flex-row lg:flex-nowrap' : 'sm:flex-row')}>
        {canAct ? (
          <>
            <Button
              className="h-[42px] w-full shrink-0 px-5 text-[14px] font-semibold !bg-[#0a6e38] hover:!bg-[#085c2f] lg:w-auto"
              onClick={() => dispatch(openModal({ type: 'accept-offer', payload: { id: offer.id } }))}
            >
              Accept offer
            </Button>
            <div className="grid grid-cols-2 gap-2 lg:contents">
              <Button
                variant="secondary"
                className="h-[42px] shrink-0 px-5 text-[14px] font-medium text-[#46494f]"
                onClick={onToggleCounter}
              >
                Counter offer
              </Button>
              <Button
                variant="secondary"
                className="h-[42px] shrink-0 border-[#fca5a5] px-5 text-[14px] font-medium text-[#e03030] hover:bg-[#fdebec]"
                onClick={() => dispatch(openModal({ type: 'decline-offer', payload: { id: offer.id } }))}
              >
                Decline
              </Button>
            </div>
          </>
        ) : null}
        <Link to={`/lots/${lotSlug}`} className={canAct ? 'w-full lg:w-auto' : 'w-full sm:ml-auto sm:w-auto'}>
          <Button variant="secondary" className="h-[42px] w-full shrink-0 px-5 text-[14px] font-medium text-[#7a7b7c] lg:w-auto">
            View item →
          </Button>
        </Link>
      </div>
    </div>
  )
}

function OfferDetailPanel({
  offer,
  counterOpen,
  counterAmount,
  onCounterAmount,
  onToggleCounter,
  onSendCounter,
  onClose,
}: {
  offer: Offer
  counterOpen: boolean
  counterAmount: string
  onCounterAmount: (v: string) => void
  onToggleCounter: () => void
  onSendCounter: () => void
  onClose?: () => void
}) {
  const lot = getLot(offer.lotId)
  if (!lot) {
    return <EmptyState title="Select an offer" body="Choose an offer from the list to review details and respond." />
  }
  const { diff, offPct } = offerDelta(offer)
  const sign = diff >= 0 ? '+' : '−'

  return (
    <div className={cn('flex min-h-0 flex-col', onClose ? 'h-full' : '')}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#ebebec] px-4 py-5 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold leading-5 text-[#1a1e26]">{lot.title}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] leading-[16.5px] text-[#9d9ea2]">{lotCode(offer.lotId)}</span>
            <DirectionPill direction={offer.direction} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusPill status={offer.status} />
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full border border-[#ebebec] text-[#7a7b7c] lg:hidden"
              aria-label="Close"
            >
              <Icon src={icons.close} size={16} />
            </button>
          ) : null}
        </div>
      </div>

      <div className={cn(onClose ? 'min-h-0 flex-1 overflow-y-auto' : '')}>
        <div className="grid grid-cols-2 border-b border-[#ebebec] lg:hidden">
          <div className="min-w-0 border-r border-[#ebebec] bg-[#f8f8f9] px-4 py-3">
            <p className="text-[11px] font-medium uppercase leading-[15px] tracking-[0.04em] text-[#7a7b7c]">
              Offer amount
            </p>
            <p className="mt-1.5 text-[20px] font-semibold leading-7 tabular-nums text-[#1a1e26]">
              {formatMoney(offer.amount)}
            </p>
          </div>
          <div className="min-w-0 px-4 py-3">
            <p className="text-[11px] font-medium uppercase leading-[15px] tracking-[0.04em] text-[#7a7b7c]">
              List price
            </p>
            <p className="mt-1.5 text-[20px] font-semibold leading-7 tabular-nums text-[#7a7b7c]">
              {formatMoney(offer.listPrice)}
            </p>
          </div>
        </div>
        <div className="border-b border-[#ebebec] px-4 py-4 lg:hidden">
          <div className="rounded-xl bg-[#f8f8f9] px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#7a7b7c]">Discount</p>
            <p className="mt-1 text-[18px] font-semibold tabular-nums text-[#0a6e38]">
              {sign}
              {formatMoney(Math.abs(diff))}
            </p>
            <p className="mt-1 text-[12px] text-[#0a6e38]">{offPct}% off list</p>
          </div>
        </div>

        <div className="hidden grid-cols-3 border-b border-[#ebebec] lg:grid">
          <div className="min-w-0 px-6 py-4">
            <p className="text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#9d9ea2]">Offer amount</p>
            <p className="mt-1 text-[16px] font-semibold leading-6 tabular-nums text-[#1a1e26]">
              {formatMoney(offer.amount)}
            </p>
          </div>
          <div className="min-w-0 border-l border-[#ebebec] px-6 py-4">
            <p className="text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#9d9ea2]">List price</p>
            <p className="mt-1 text-[16px] font-semibold leading-6 tabular-nums text-[#7a7b7c]">
              {formatMoney(offer.listPrice)}
            </p>
          </div>
          <div className="min-w-0 border-l border-[#ebebec] px-6 py-4">
            <p className="text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#9d9ea2]">Discount</p>
            <p className="mt-1 text-[16px] font-semibold leading-6 tabular-nums text-[#0a6e38]">
              {sign}
              {formatMoney(Math.abs(diff))} ({offPct}% off)
            </p>
          </div>
        </div>

        <dl className="space-y-2 px-4 py-4 text-[12px] leading-4 sm:px-6">
          <div className="flex justify-between gap-4">
            <dt className="text-[#7a7b7c]">Counterparty</dt>
            <dd className="min-w-0 truncate font-medium text-[#46494f]">{offer.counterparty}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#7a7b7c]">Created</dt>
            <dd className="font-medium text-[#46494f]">{formatOfferDate(offer.createdAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#7a7b7c]">Expires</dt>
            <dd className="font-medium text-[#46494f]">{formatOfferDate(offer.expiresAt)}</dd>
          </div>
          {offer.note ? (
            <div className="pt-2">
              <p className="rounded-xl border border-[#ebebec] bg-[#f5f5f6] px-3 py-3 text-[12px] leading-[19.5px] text-[#46494f]">
                “{offer.note}”
              </p>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="shrink-0 border-t border-[#ebebec] px-4 py-4 sm:px-6">
        <OfferActions
          offer={offer}
          lotSlug={lot.slug}
          counterOpen={counterOpen}
          counterAmount={counterAmount}
          onCounterAmount={onCounterAmount}
          onToggleCounter={onToggleCounter}
          onSendCounter={onSendCounter}
        />
      </div>
    </div>
  )
}

export function OffersPage() {
  const dispatch = useAppDispatch()
  const offers = useAppSelector((s) => s.offers.items)
  const [filter, setFilter] = useState<FilterId>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [counterOpen, setCounterOpen] = useState(false)
  const [counterAmount, setCounterAmount] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)

  const awaiting = offers.filter((o) => o.status === 'pending' && o.direction === 'received').length

  const filtered = useMemo(() => {
    if (filter === 'all') return offers
    if (filter === 'received' || filter === 'sent') return offers.filter((o) => o.direction === filter)
    return offers.filter((o) => o.status === filter)
  }, [offers, filter])

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !filtered.some((o) => o.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  useEffect(() => {
    setCounterOpen(false)
  }, [selectedId])

  const selected = offers.find((o) => o.id === selectedId) ?? null

  useEffect(() => {
    if (selected) {
      setCounterAmount(String(Math.round(selected.amount * 1.05)))
    }
  }, [selected])

  useEffect(() => {
    if (!sheetOpen) return
    document.body.style.overflow = 'hidden'
    const onResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) setSheetOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('resize', onResize)
    }
  }, [sheetOpen])

  const sendCounter = () => {
    if (!selected) return
    const amount = Number(counterAmount)
    if (!amount) {
      dispatch(showToast('Enter a valid counter amount'))
      return
    }
    dispatch(setOfferStatus({ id: selected.id, status: 'countered', amount }))
    setCounterOpen(false)
    dispatch(
      showSuccess({
        title: 'Counter Offer Sent',
        body: 'Your counter offer has been sent to the counterparty.',
        actionLabel: 'Done',
      }),
    )
  }

  const selectOffer = (id: string) => {
    setSelectedId(id)
    if (typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches) {
      setSheetOpen(true)
    }
  }

  const detailProps = selected
    ? {
        offer: selected,
        counterOpen,
        counterAmount,
        onCounterAmount: setCounterAmount,
        onToggleCounter: () => setCounterOpen((v) => !v),
        onSendCounter: sendCounter,
      }
    : null

  return (
    <div className="animate-fade-in min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">Offers</h1>
          <p className="pt-1 text-[14px] leading-5 text-[#7a7b7c]">
            Manage received and sent offers on auction lots
          </p>
        </div>
        {awaiting > 0 ? (
          <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-[#fcd34d] bg-[#fef3c7] px-4 py-2 text-[12px] font-medium text-[#92400e]">
            <span className="size-2 rounded-full bg-[#92400e]" />
            {awaiting} offer{awaiting === 1 ? '' : 's'} awaiting response
          </span>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:items-start">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
          <div className="flex h-[55px] items-center gap-1 overflow-x-auto border-b border-[#ebebec] px-4 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  'h-[30px] shrink-0 rounded-full border px-3 text-[12px] font-medium leading-4 transition',
                  filter === f.id
                    ? 'border-[#dacdd0] bg-[#f9f5f6] text-[#480516]'
                    : 'border-transparent text-[#7a7b7c] hover:text-[#1a1e26]',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No offers" body="Offers appear here when counterparties negotiate on lots." />
            </div>
          ) : (
            <div className="flex flex-col lg:p-3">
              {filtered.map((offer) => (
                <OfferRow
                  key={offer.id}
                  offer={offer}
                  active={offer.id === selectedId}
                  onSelect={() => selectOffer(offer.id)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="hidden min-w-0 overflow-hidden rounded-2xl border border-[#ebebec] bg-white lg:block">
          {detailProps ? (
            <OfferDetailPanel {...detailProps} />
          ) : (
            <div className="p-6">
              <EmptyState title="Select an offer" body="Choose an offer from the list to review details and respond." />
            </div>
          )}
        </section>
      </div>

      {sheetOpen && detailProps
        ? createPortal(
            <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal aria-label="Offer details">
              <button
                type="button"
                className="absolute inset-0 bg-[#1a1e26]/50"
                aria-label="Close offer details"
                onClick={() => setSheetOpen(false)}
              />
              <aside className="absolute inset-x-0 bottom-0 flex max-h-[min(92dvh,760px)] flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-12px_40px_rgba(26,30,38,0.2)]">
                <div className="flex justify-center pt-2.5" aria-hidden>
                  <span className="h-1 w-10 rounded-full bg-[#d7d7d9]" />
                </div>
                <OfferDetailPanel {...detailProps} onClose={() => setSheetOpen(false)} />
              </aside>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
