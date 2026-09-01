import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLot } from '@/api/fixtures'
import { Button } from '@/components/shared/Button'
import { EmptyState, PageHeader } from '@/components/shared/PageChrome'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { openModal, showSuccess, showToast } from '@/store/slices/uiSlice'
import { setOfferStatus } from '@/store/slices/offersSlice'
import { cn, formatMoney } from '@/utils/format'
import type { Offer, OfferStatus } from '@/types'

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

function statusTone(status: OfferStatus) {
  switch (status) {
    case 'pending':
      return 'bg-[#fff6e5] text-[#b45309]'
    case 'accepted':
      return 'bg-[#e8f6ee] text-[#1f7a45]'
    case 'declined':
      return 'bg-[#fdebec] text-[#c62828]'
    case 'countered':
      return 'bg-[#e8f1ff] text-[#1d4ed8]'
    case 'expired':
      return 'bg-[#f3f4f6] text-[#6b7280]'
    default:
      return 'bg-[#f3f4f6] text-[#6b7280]'
  }
}

function StatusPill({ status }: { status: OfferStatus }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', statusTone(status))}>
      {status}
    </span>
  )
}

function DirectionPill({ direction }: { direction: Offer['direction'] }) {
  return (
    <span
      className={cn(
        'inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium capitalize',
        direction === 'received' ? 'bg-[#f9f5f6] text-[#480516]' : 'bg-[#f3f4f6] text-[#6b7280]',
      )}
    >
      {direction}
    </span>
  )
}

function offerDelta(offer: Offer) {
  const diff = offer.amount - offer.listPrice
  const pctOfList = offer.listPrice ? Math.round((offer.amount / offer.listPrice) * 100) : 0
  const offPct = offer.listPrice ? Math.round((Math.abs(diff) / offer.listPrice) * 100) : 0
  return { diff, pctOfList, offPct }
}

export function OffersPage() {
  const dispatch = useAppDispatch()
  const offers = useAppSelector((s) => s.offers.items)
  const [filter, setFilter] = useState<FilterId>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [counterOpen, setCounterOpen] = useState(false)
  const [counterAmount, setCounterAmount] = useState('')

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
  const selectedLot = selected ? getLot(selected.lotId) : undefined

  useEffect(() => {
    if (selected) {
      const suggested = Math.round(selected.amount * 1.05)
      setCounterAmount(String(suggested))
    }
  }, [selected])

  const canAct = selected?.status === 'pending' && selected.direction === 'received'

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Offers"
        subtitle="Manage received and sent offers on auction lots"
        actions={
          awaiting > 0 ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fff6e5] px-3 py-1.5 text-[13px] font-medium text-[#8a6116]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b45309]" />
              {awaiting} offer{awaiting === 1 ? '' : 's'} awaiting response
            </span>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              'h-9 rounded-full px-4 text-[13px] font-medium transition',
              filter === f.id
                ? 'bg-[#480516] text-white'
                : 'bg-white text-[#7a7b7c] ring-1 ring-[#ebebec] hover:text-[#1a1e26]',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* List */}
        <section className="overflow-hidden rounded-xl border border-[#ebebec] bg-white">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No offers" body="Offers appear here when counterparties negotiate on lots." />
            </div>
          ) : (
            <div className="divide-y divide-[#ebebec] p-2">
              {filtered.map((offer) => {
                const lot = getLot(offer.lotId)
                const { diff, pctOfList } = offerDelta(offer)
                const active = offer.id === selectedId
                return (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => setSelectedId(offer.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl p-3 text-left transition',
                      active ? 'border border-[#480516] bg-[#fdfbfb]' : 'border border-transparent hover:bg-[#f9fafb]',
                    )}
                  >
                    <img
                      src={lot?.image}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#1a1e26]">
                        {lot?.title ?? offer.lotId}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-[#9ca3af]">{lotCode(offer.lotId)}</span>
                        <DirectionPill direction={offer.direction} />
                      </div>
                      <p className="mt-1 truncate text-[12px] text-[#7a7b7c]">{offer.counterparty}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[14px] font-semibold tabular-nums text-[#1a1e26]">
                        {formatMoney(offer.amount)}
                      </p>
                      <p className="mt-0.5 text-[11px] tabular-nums text-[#9ca3af]">
                        {pctOfList}% of list · {diff >= 0 ? '+' : '-'}
                        {formatMoney(Math.abs(diff))}
                      </p>
                      <div className="mt-1.5 flex justify-end">
                        <StatusPill status={offer.status} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* Detail */}
        <section className="rounded-xl border border-[#ebebec] bg-white p-5">
          {!selected || !selectedLot ? (
            <EmptyState title="Select an offer" body="Choose an offer from the list to review details and respond." />
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-[18px] font-semibold leading-snug text-[#1a1e26]">{selectedLot.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[13px] text-[#7a7b7c]">{lotCode(selected.lotId)}</span>
                    <DirectionPill direction={selected.direction} />
                  </div>
                </div>
                <StatusPill status={selected.status} />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-[#ebebec] px-4 py-4 sm:grid-cols-3">
                {(() => {
                  const { diff, offPct } = offerDelta(selected)
                  return (
                    <>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Offer amount</p>
                        <p className="mt-1 text-[20px] font-semibold tabular-nums text-[#1a1e26]">
                          {formatMoney(selected.amount)}
                        </p>
                      </div>
                      <div className="border-t border-[#ebebec] pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                        <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">List price</p>
                        <p className="mt-1 text-[20px] font-semibold tabular-nums text-[#7a7b7c]">
                          {formatMoney(selected.listPrice)}
                        </p>
                      </div>
                      <div className="border-t border-[#ebebec] pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                        <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Discount</p>
                        <p className="mt-1 text-[18px] font-semibold tabular-nums text-[#1f7a45]">
                          {diff >= 0 ? '+' : '-'}
                          {formatMoney(Math.abs(diff))} ({offPct}% off)
                        </p>
                      </div>
                    </>
                  )
                })()}
              </div>

              <dl className="mt-5 space-y-3 text-[14px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#9ca3af]">Counterparty</dt>
                  <dd className="font-medium text-[#1a1e26]">{selected.counterparty}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#9ca3af]">Created</dt>
                  <dd className="font-medium text-[#1a1e26]">{formatOfferDate(selected.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#9ca3af]">Expires</dt>
                  <dd className="font-medium text-[#1a1e26]">{formatOfferDate(selected.expiresAt)}</dd>
                </div>
              </dl>

              {selected.note ? (
                <div className="mt-5 rounded-xl bg-[#f5f5f6] px-4 py-3 text-[14px] italic leading-relaxed text-[#4b5563]">
                  “{selected.note}”
                </div>
              ) : null}

              {canAct && counterOpen ? (
                <div className="mt-5 space-y-3 rounded-xl border border-[#ebebec] p-4">
                  <label className="block text-[12px] font-medium text-[#4b5563]">
                    Counter offer amount (US$)
                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#9ca3af]">
                        US$
                      </span>
                      <input
                        type="number"
                        value={counterAmount}
                        onChange={(e) => setCounterAmount(e.target.value)}
                        className="h-11 w-full rounded-xl border border-[#ebebec] bg-white py-2 pl-12 pr-3 text-[14px] outline-none focus:border-[#480516]"
                      />
                    </div>
                  </label>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => {
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
                      }}
                    >
                      Send counter
                    </Button>
                    <Button variant="secondary" className="flex-1" onClick={() => setCounterOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                {canAct ? (
                  <>
                    <Button
                      className="!bg-[#0e603c] hover:!bg-[#0a4d30]"
                      onClick={() =>
                        dispatch(openModal({ type: 'accept-offer', payload: { id: selected.id } }))
                      }
                    >
                      Accept offer
                    </Button>
                    <Button
                      variant="secondary"
                      className="border-[#480516] text-[#480516]"
                      onClick={() => setCounterOpen(true)}
                    >
                      Counter offer
                    </Button>
                    <Button
                      variant="secondary"
                      className="border-[#ff383c] text-[#ff383c] hover:bg-[#fdebec]"
                      onClick={() =>
                        dispatch(openModal({ type: 'decline-offer', payload: { id: selected.id } }))
                      }
                    >
                      Decline
                    </Button>
                  </>
                ) : null}
                <Link to={`/lots/${selectedLot.slug}`} className="ml-auto">
                  <Button variant="soft">View item →</Button>
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
