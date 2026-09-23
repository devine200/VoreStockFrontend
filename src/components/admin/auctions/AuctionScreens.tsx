import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AdminBack,
  AdminBadge,
  AdminCard,
  AdminFilter,
  AdminKv,
  AdminSearch,
} from '@/components/admin/ui'
import {
  AdminDataTable,
  AdminListShell,
  AdminNotFound,
  AdminSummaryGrid,
  AdminTablePanel,
  StatusCell,
  TwoCol,
  matchesQuery,
} from '@/components/admin/screens'
import { useAppSelector } from '@/store/hooks'
import type { AdminAuction, AdminAuctionBid } from '@/types/admin'
import { cn } from '@/utils/format'

function CountdownCell({ status, ends }: { status: string; ends: string }) {
  const live = status === 'Live'
  return (
    <span className={cn('text-[13px]', live ? 'font-medium text-amber-600' : 'text-slate-700')}>{ends}</span>
  )
}

function AuctionKpi({
  label,
  value,
  hint,
  valueClass,
  hintClass,
}: {
  label: string
  value: string
  hint?: string
  valueClass?: string
  hintClass?: string
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl border border-slate-200 bg-white px-[18px] py-4">
      <p className="text-[12px] font-normal leading-[normal] text-slate-500">{label}</p>
      <p className={cn('text-[21px] font-semibold leading-[normal] text-slate-900', valueClass)}>{value}</p>
      {hint ? (
        <p className={cn('text-[11.5px] font-normal leading-[normal] text-slate-500', hintClass)}>{hint}</p>
      ) : null}
    </div>
  )
}

function BidHoldCell({ bid }: { bid: AdminAuctionBid }) {
  if (bid.holdKind === 'badge') return <AdminBadge status={bid.hold} />
  return <span className="text-[13px] text-slate-500">{bid.hold}</span>
}

function BidActivityTable({
  items,
  subtitle,
  earlierHidden,
}: {
  items: AdminAuctionBid[]
  subtitle: string
  earlierHidden?: number
}) {
  const grid = '1.2fr 1fr 1.2fr 1fr 1fr'
  const columns = [
    { header: 'Bidder', mobile: 'title' as const, render: (bid: AdminAuctionBid) => bid.bidder },
    {
      header: 'Bid amount',
      mobile: 'value' as const,
      render: (bid: AdminAuctionBid) => (
        <span className={cn('font-medium', bid.highlight ? 'text-emerald-700' : 'text-slate-800')}>{bid.amount}</span>
      ),
    },
    {
      header: 'Date / time',
      mobile: 'meta' as const,
      render: (bid: AdminAuctionBid) => <span className="text-slate-500">{bid.at}</span>,
    },
    {
      header: 'Bid status',
      mobile: 'status' as const,
      render: (bid: AdminAuctionBid) => <AdminBadge status={bid.status} />,
    },
    {
      header: 'Bid hold',
      mobile: 'hide' as const,
      render: (bid: AdminAuctionBid) => <BidHoldCell bid={bid} />,
    },
  ]
  return (
    <div className="flex w-full flex-col gap-3">
      <div>
        <p className="text-[15px] font-semibold leading-[normal] text-slate-800">Bid activity</p>
        <p className="mt-0.5 text-[12px] font-normal leading-[normal] text-slate-500">{subtitle}</p>
      </div>
      <AdminDataTable
        rows={items}
        columns={columns}
        grid={grid}
        pageSize={Math.max(items.length, 1)}
        noun="bids"
        embedded={false}
      />
      {earlierHidden ? (
        <p className="text-[12px] font-normal leading-[normal] text-slate-400">
          +{earlierHidden} earlier bids not shown
        </p>
      ) : null}
    </div>
  )
}

export function AuctionList() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.auctions)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [sort, setSort] = useState('Ending soon')

  const filtered = useMemo(() => {
    const list = rows.filter(
      (r) =>
        matchesQuery(`${r.id} ${r.product} ${r.highestBidder}`, query) &&
        (status === 'All' || r.status === status),
    )
    if (sort === 'Newest first') return [...list].reverse()
    return list
  }, [rows, query, status, sort])

  return (
    <AdminListShell
      title="Auctions"
      subtitle="Monitor live lots, countdowns, and bid activity."
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <AdminSearch
            className="w-full sm:w-[270px]"
            value={query}
            onChange={setQuery}
            placeholder="Search by auction ID or product"
          />
          <AdminFilter
            label="Status"
            value={status}
            onChange={setStatus}
            options={['All', 'Live', 'Upcoming', 'Ended']}
          />
          <AdminFilter label="Date" value="All time" onChange={() => undefined} options={['All time']} />
          <AdminFilter
            label="Sort"
            value={sort}
            onChange={setSort}
            options={['Ending soon', 'Newest first']}
          />
        </div>
      }
    >
      <AdminTablePanel>
        <AdminDataTable
          embedded
          rows={filtered}
          pageSize={8}
          noun="auctions"
          grid="0.85fr 1.55fr 0.85fr 0.55fr 1fr 0.85fr 0.95fr 1fr 0.7fr 48px"
          actionLabel="Open"
          onRow={(r) => navigate(`/admin/auctions/${r.id}`)}
          columns={[
            {
              header: 'Auction ID',
              render: (r) => <span className="font-medium text-[#480516]">{r.id}</span>,
            },
            { header: 'Product / Lot', render: (r) => r.product },
            { header: 'Current Bid', render: (r) => r.currentBid },
            { header: 'Bids', render: (r) => String(r.bids) },
            { header: 'Highest Bidder', render: (r) => r.highestBidder },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
            { header: 'Start', render: (r) => r.starts },
            {
              header: 'End / Countdown',
              render: (r) => <CountdownCell status={r.status} ends={r.ends} />,
            },
            { header: 'Bid Hold', render: (r) => r.bidHold },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

function AuctionDetailView({ item }: { item: AdminAuction }) {
  const navigate = useNavigate()
  const live = item.status === 'Live'
  const ended = item.status === 'Ended'

  return (
    <div className="flex w-full max-w-full flex-col gap-4 animate-fade-in sm:gap-5">
      <AdminBack label="Back to Auctions" onClick={() => navigate('/admin/auctions')} />

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-[20px] font-semibold leading-[normal] text-slate-900">{item.id}</h1>
          <AdminBadge status={item.status} />
        </div>
        <p className="text-[13.5px] font-normal leading-[normal] text-slate-500">
          {item.product} · {item.tier}
        </p>
        <p className="text-[12px] font-normal leading-[normal] text-slate-400">
          {ended
            ? `Started ${item.startsFull} · Ended ${item.endsFull}`
            : live
              ? `Started ${item.startsFull}`
              : `Starts ${item.startsFull}`}
        </p>
      </div>

      <AdminSummaryGrid cols={4}>
        {live ? (
          <>
            <AuctionKpi label="Current bid" value={item.currentBid} valueClass="text-[#480516]" />
            <AuctionKpi label="Highest bidder" value={item.highestBidder} />
            <AuctionKpi
              label="Time remaining"
              value={item.timeRemaining ?? item.ends}
              hint={item.timeHint}
              valueClass="text-amber-600"
              hintClass="text-amber-600"
            />
            <AuctionKpi label="Number of bids" value={String(item.bids)} />
          </>
        ) : ended ? (
          <>
            <AuctionKpi label="Winning bid" value={item.currentBid} valueClass="text-emerald-700" />
            <AuctionKpi label="Winning bidder" value={item.highestBidder} />
            <AuctionKpi
              label="Auction ended"
              value={item.endedDate ?? item.endsFull}
              hint={item.endedClock}
              valueClass="text-slate-900"
            />
            <AuctionKpi label="Number of bids" value={String(item.bids)} />
          </>
        ) : (
          <>
            <AuctionKpi label="Current bid" value={item.currentBid} />
            <AuctionKpi label="Highest bidder" value={item.highestBidder} />
            <AuctionKpi label="Starts" value={item.startsFull} valueClass="text-slate-900" />
            <AuctionKpi label="Number of bids" value={String(item.bids)} />
          </>
        )}
      </AdminSummaryGrid>

      {ended && item.banner ? (
        <div className="flex w-full items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
          <span className="mt-0.5 flex size-[15px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold leading-none text-white" aria-hidden>
            ✓
          </span>
          <p className="text-[12.5px] font-normal leading-[18px] text-emerald-700">
            {item.orderId ? (
              <>
                Winner confirmed. This win moved into the 12-hour settlement window and was paid on time.
                Resulting order:{' '}
                <button
                  type="button"
                  className="font-medium text-emerald-800 underline hover:no-underline"
                  onClick={() => navigate(`/admin/orders/${item.orderId}`)}
                >
                  {`${item.orderId} (${item.orderStatus})`}
                </button>
                {'.'}
              </>
            ) : (
              item.banner
            )}
          </p>
        </div>
      ) : null}

      <TwoCol>
        <AdminCard title="Auction information" className="space-y-3">
          <AdminKv label="Auction / Lot ID" value={item.id} />
          <AdminKv label="Status" badge={item.status} />
          <AdminKv label="Start time" value={item.startsFull} />
          <AdminKv label="End time" value={item.endsFull} />
          <AdminKv label="Bid hold amount" value={item.bidHoldDetail} tone="strong" />
        </AdminCard>
        <AdminCard title="B-Stock catalog context" className="space-y-3">
          <AdminKv label="Product" value={item.product} />
          <AdminKv label="Tier" value={item.tier} />
          <AdminKv label="B-Stock lot ref" value={item.catalogRef} />
          <AdminKv label="Sync status" badge={item.syncStatus} />
        </AdminCard>
      </TwoCol>

      {item.bidActivity.length > 0 ? (
        <BidActivityTable
          items={item.bidActivity}
          earlierHidden={item.earlierBidsHidden}
          subtitle={
            live
              ? 'Most recent bids first. Current highest bid is highlighted.'
              : 'Final bids for this auction. Winning bid is highlighted.'
          }
        />
      ) : (
        <AdminCard title="Bid activity">
          <p className="text-[13px] text-slate-500">No bids yet. This auction has not started.</p>
        </AdminCard>
      )}
    </div>
  )
}

export function AuctionDetail() {
  const { id } = useParams()
  const item = useAppSelector((s) => s.admin.auctions.find((r) => r.id === id))
  if (!item) return <AdminNotFound label="Back to Auctions" to="/admin/auctions" />
  return <AuctionDetailView item={item} />
}
