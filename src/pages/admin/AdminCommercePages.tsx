import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminBadge, AdminButton, AdminCard, AdminFilter, AdminKv, AdminSearch } from '@/components/admin/ui'
import {
  AdminDataTable,
  AdminDetailShell,
  AdminListShell,
  AdminNotFound,
  AdminTablePanel,
  ConfirmModal,
  FieldInput,
  HistoryPanel,
  StatusCell,
  TwoCol,
  matchesQuery,
} from '@/components/admin/screens'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { saveLotEdits, setRecordStatus } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'

export function AdminAuctionsPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.auctions)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const filtered = useMemo(
    () => rows.filter((r) => matchesQuery(`${r.title} ${r.id} ${r.product}`, query) && (status === 'All' || r.status === status)),
    [rows, query, status],
  )
  return (
    <AdminListShell title="Auctions" subtitle="Monitor live lots, countdowns, and bid activity." showExport>
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch className="w-full sm:w-[270px]" value={query} onChange={setQuery} placeholder="Search by auction ID or product" />
            <AdminFilter label="Status" value={status} onChange={setStatus} options={['All', 'Live', 'Ended', 'Upcoming']} />
            <AdminFilter label="Date" value="All time" onChange={() => undefined} options={['All time']} />
            <AdminFilter value="Sort: Ending soon" onChange={() => undefined} options={['Sort: Ending soon']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={filtered}
          grid="0.8fr 1.4fr 0.8fr 0.6fr 1fr 0.8fr 0.9fr 0.9fr 0.8fr 72px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/auctions/${r.id}`)}
          columns={[
            { header: 'Auction ID', render: (r) => r.id },
            { header: 'Product / lot', render: (r) => r.product },
            { header: 'Current bid', render: (r) => r.currentBid },
            { header: 'Bids', render: (r) => String(r.bids) },
            { header: 'Highest bidder', render: (r) => r.highestBidder },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
            { header: 'Start', render: (r) => r.starts },
            { header: 'End / countdown', render: (r) => r.ends },
            { header: 'Bid hold', render: (r) => r.bidHold },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminAuctionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const item = useAppSelector((s) => s.admin.auctions.find((r) => r.id === id))
  const lots = useAppSelector((s) => s.admin.lots)
  if (!item) return <AdminNotFound label="Back to auctions" to="/admin/auctions" />
  return (
    <AdminDetailShell
      backLabel="Back to auctions"
      onBack={() => navigate('/admin/auctions')}
      title={item.title}
      badge={item.status}
      subtitle={`${item.id} · ${item.product} · ${item.gmv} GMV`}
    >
      <TwoCol>
        <AdminCard title="Event" className="space-y-3">
          <AdminKv label="Starts" value={item.starts} />
          <AdminKv label="Ends" value={item.ends} />
          <AdminKv label="Lots" value={String(item.lots)} />
          <AdminKv label="Bids" value={String(item.bids)} />
          <AdminKv label="GMV" value={item.gmv} />
        </AdminCard>
        <AdminCard title="Lots in this event">
          {lots.slice(0, 4).map((lot) => (
            <button key={lot.id} type="button" className="flex w-full items-center justify-between border-b border-slate-100 py-2 text-left last:border-0" onClick={() => navigate(`/admin/lots/${lot.id}`)}>
              <span className="text-[13px] text-slate-800">{lot.title}</span>
              <AdminBadge status={lot.status} />
            </button>
          ))}
        </AdminCard>
      </TwoCol>
    </AdminDetailShell>
  )
}

export function AdminLotsPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.lots)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const filtered = useMemo(
    () => rows.filter((r) => matchesQuery(`${r.title} ${r.id} ${r.category}`, query) && (status === 'All' || r.status === status)),
    [rows, query, status],
  )
  return (
    <AdminListShell title="Products & lots" subtitle="Published inventory, drafts, and BidBridge-synced lots." showExport>
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search lots" />
            <AdminFilter value={status} onChange={setStatus} options={['All', 'Published', 'Live', 'Ended']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={filtered}
          grid="0.7fr 1.6fr 0.8fr 0.8fr 0.8fr 72px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/lots/${r.id}`)}
          columns={[
            { header: 'Lot', render: (r) => r.id },
            { header: 'Title', render: (r) => r.title },
            { header: 'Category', render: (r) => r.category },
            { header: 'Current bid', render: (r) => r.currentBid },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminLotDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.lots.find((r) => r.id === id))
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(item?.title ?? '')
  const [unsaved, setUnsaved] = useState(false)
  if (!item) return <AdminNotFound label="Back to lots" to="/admin/lots" />
  return (
    <AdminDetailShell
      backLabel="Back to lots"
      onBack={() => {
        if (editing && title !== item.title) setUnsaved(true)
        else navigate('/admin/lots')
      }}
      title={item.title}
      badge={item.status}
      subtitle={`${item.id} · ${item.category} · ${item.location}`}
      actions={
        editing ? (
          <AdminButton
            onClick={() => {
              dispatch(saveLotEdits({ id: item.id, title, status: item.status }))
              dispatch(showToast('Lot saved'))
              setEditing(false)
            }}
          >
            Save
          </AdminButton>
        ) : (
          <AdminButton variant="outline" onClick={() => setEditing(true)}>Edit lot</AdminButton>
        )
      }
    >
      {editing ? <FieldInput label="Title" value={title} onChange={setTitle} /> : null}
      <TwoCol>
        <AdminCard title="Listing" className="space-y-3">
          <AdminKv label="Condition" value={item.condition} />
          <AdminKv label="Source" value={item.source} />
          <AdminKv label="Published" value={item.published} />
          <AdminKv label="Current bid" value={item.currentBid} />
        </AdminCard>
        <AdminCard title="Placement">
          <p className="text-[13px] text-slate-500">Synced from {item.source}. Open Sync & sources to republish or retry failed items.</p>
          <AdminButton className="mt-3" variant="outline" onClick={() => navigate('/admin/sync')}>Open sync</AdminButton>
        </AdminCard>
      </TwoCol>
      {unsaved ? (
        <ConfirmModal
          title="Unsaved changes"
          body="Leave without saving this lot?"
          confirmLabel="Discard"
          danger
          onClose={() => setUnsaved(false)}
          onConfirm={() => navigate('/admin/lots')}
        />
      ) : null}
    </AdminDetailShell>
  )
}

export function AdminOrdersPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.orders)
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => rows.filter((r) => matchesQuery(`${r.id} ${r.buyer} ${r.lot}`, query)), [rows, query])
  return (
    <AdminListShell title="Orders" subtitle="Won lots moving through payment, 3PL, customs, and delivery." showExport>
      <AdminTablePanel toolbar={<AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search orders" />}>
        <AdminDataTable
          embedded
          rows={filtered}
          grid="0.8fr 1fr 1.3fr 0.7fr 0.9fr 72px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/orders/${r.id}`)}
          columns={[
            { header: 'Order', render: (r) => r.id },
            { header: 'Buyer', render: (r) => r.buyer },
            { header: 'Lot', render: (r) => r.lot },
            { header: 'Total', render: (r) => r.total },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const item = useAppSelector((s) => s.admin.orders.find((r) => r.id === id))
  if (!item) return <AdminNotFound label="Back to orders" to="/admin/orders" />
  return (
    <AdminDetailShell
      backLabel="Back to orders"
      onBack={() => navigate('/admin/orders')}
      title={item.id}
      badge={item.status}
      subtitle={`${item.buyer} · ${item.lot}`}
    >
      <TwoCol>
        <AdminCard title="Order" className="space-y-3">
          <AdminKv label="Buyer" value={item.buyer} />
          <AdminKv label="Lot" value={item.lot} />
          <AdminKv label="Total" value={item.total} />
          <AdminKv label="Placed" value={item.placed} />
          <AdminKv label="Fulfillment" value={item.fulfillment} />
        </AdminCard>
        <HistoryPanel items={item.history} />
      </TwoCol>
    </AdminDetailShell>
  )
}

export function AdminShipmentsPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.shipments)
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => rows.filter((r) => matchesQuery(`${r.id} ${r.orderId} ${r.buyer} ${r.tracking}`, query)), [rows, query])
  return (
    <AdminListShell title="Shipments" subtitle="In-transit, customs, and delivered freight." showExport>
      <AdminTablePanel toolbar={<AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search shipments or tracking" />}>
        <AdminDataTable
          embedded
          rows={filtered}
          grid="0.8fr 0.8fr 1fr 1.2fr 1fr 72px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/shipments/${r.id}`)}
          columns={[
            { header: 'Shipment', render: (r) => r.id },
            { header: 'Order', render: (r) => r.orderId },
            { header: 'Buyer', render: (r) => r.buyer },
            { header: 'Tracking', render: (r) => r.tracking },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminShipmentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const item = useAppSelector((s) => s.admin.shipments.find((r) => r.id === id))
  if (!item) return <AdminNotFound label="Back to shipments" to="/admin/shipments" />
  return (
    <AdminDetailShell
      backLabel="Back to shipments"
      onBack={() => navigate('/admin/shipments')}
      title={item.id}
      badge={item.status}
      subtitle={`${item.orderId} · ${item.buyer}`}
    >
      <TwoCol>
        <AdminCard title="Freight" className="space-y-3">
          <AdminKv label="Carrier" value={item.carrier} />
          <AdminKv label="Tracking" value={item.tracking} />
          <AdminKv label="Origin" value={item.origin} />
          <AdminKv label="Destination" value={item.destination} />
          <AdminKv label="ETA" value={item.eta} />
        </AdminCard>
        <HistoryPanel items={item.history} />
      </TwoCol>
    </AdminDetailShell>
  )
}

export function AdminTransactionsPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.transactions)
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => rows.filter((r) => matchesQuery(`${r.id} ${r.buyer} ${r.type} ${r.reference}`, query)), [rows, query])
  return (
    <AdminListShell title="Transactions" subtitle="Deposits, bid holds, settlement charges, and refunds." showExport>
      <AdminTablePanel toolbar={<AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search transactions" />}>
        <AdminDataTable
          embedded
          rows={filtered}
          grid="0.9fr 1fr 0.9fr 0.7fr 0.8fr 72px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/transactions/${r.id}`)}
          columns={[
            { header: 'ID', render: (r) => r.id },
            { header: 'Buyer', render: (r) => r.buyer },
            { header: 'Type', render: (r) => r.type },
            { header: 'Amount', render: (r) => r.amount },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminTransactionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.transactions.find((r) => r.id === id))
  const [modal, setModal] = useState(false)
  if (!item) return <AdminNotFound label="Back to transactions" to="/admin/transactions" />
  return (
    <AdminDetailShell
      backLabel="Back to transactions"
      onBack={() => navigate('/admin/transactions')}
      title={item.id}
      badge={item.status}
      subtitle={`${item.buyer} · ${item.type}`}
      actions={item.type !== 'Refund' ? <AdminButton variant="dangerOutline" onClick={() => setModal(true)}>Initiate refund</AdminButton> : undefined}
    >
      <TwoCol>
        <AdminCard title="Transaction" className="space-y-3">
          <AdminKv label="Amount" value={item.amount} />
          <AdminKv label="Method" value={item.method} />
          <AdminKv label="Reference" value={item.reference} />
          <AdminKv label="When" value={item.at} />
        </AdminCard>
        <HistoryPanel items={item.history} />
      </TwoCol>
      {modal ? (
        <ConfirmModal
          title="Initiate refund"
          body="Credit this amount back to the buyer wallet. Recorded in the audit log."
          confirmLabel="Refund"
          onClose={() => setModal(false)}
          onConfirm={() => {
            dispatch(setRecordStatus({ collection: 'transactions', id: item.id, status: 'Refunded' }))
            dispatch(showToast('Refund initiated'))
            setModal(false)
          }}
        />
      ) : null}
    </AdminDetailShell>
  )
}
