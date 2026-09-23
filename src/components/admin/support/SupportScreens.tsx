import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AdminBack,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminFilter,
  AdminKv,
  AdminModal,
  AdminSearch,
} from '@/components/admin/ui'
import { AdminDataTable, AdminListShell, StatusCell, matchesQuery } from '@/components/admin/screens'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addAdminNote, replyToTicket, setRecordStatus } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminTicket } from '@/types/admin'
import { cn } from '@/utils/format'

function formatClosedAt() {
  return new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function priorityLabel(priority: string) {
  return `${priority} priority`
}

type ModalKind = 'assign' | 'status' | 'resolve' | 'close' | 'note' | null

const ASSIGNEES = ['Ops Admin', 'Zainab Musa', 'David Okafor'] as const
const STATUSES = ['Open', 'In Progress', 'Waiting for Buyer', 'Resolved', 'Closed'] as const

export function SupportQueue() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.tickets)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [priority, setPriority] = useState('All')
  const [category, setCategory] = useState('All')
  const [sla, setSla] = useState('All')
  const filtered = useMemo(() => {
    const list = rows.filter(
      (r) =>
        matchesQuery(`${r.buyer} ${r.subject} ${r.id} ${r.assignee}`, query) &&
        (status === 'All' || r.status === status) &&
        (priority === 'All' || r.priority === priority) &&
        (category === 'All' || r.category === category) &&
        (sla === 'All' ||
          (sla === 'Breached' ? r.sla === 'Breached' : sla === 'Within SLA' ? r.sla === 'Within SLA' : r.sla === sla)),
    )
    const urgency = (r: AdminTicket) => {
      if (r.sla === 'Breached') return 0
      if (r.sla.includes('left')) {
        const match = r.sla.match(/(\d+)(m|h)/)
        if (!match) return 50
        const n = Number(match[1])
        return match[2] === 'h' ? n * 60 : n
      }
      if (r.sla === 'Within SLA') return 900
      return 500
    }
    return [...list].sort((a, b) => urgency(a) - urgency(b))
  }, [rows, query, status, priority, category, sla])
  return (
    <AdminListShell
      title="Support"
      subtitle="Tickets approaching or past SLA are prioritized first."
      toolbar={
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 [&>label]:w-full sm:[&>label]:w-auto">
            <AdminSearch
              className="w-full sm:w-[280px] sm:flex-none"
              value={query}
              onChange={setQuery}
              placeholder="Search by ticket ID, buyer, or subject"
            />
            <AdminFilter
              label="Status"
              value={status}
              onChange={setStatus}
              options={['All', 'Open', 'In Progress', 'Waiting for Buyer', 'Resolved', 'Closed']}
            />
            <AdminFilter
              label="Priority"
              value={priority}
              onChange={setPriority}
              options={['All', 'Urgent', 'High', 'Medium', 'Low']}
            />
            <AdminFilter
              label="Category"
              value={category}
              onChange={setCategory}
              options={['All', 'Settlement', 'Shipping', 'KYC docs', 'Withdrawal', 'Account']}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 [&>label]:w-full sm:[&>label]:w-auto">
            <AdminFilter
              label="SLA"
              value={sla}
              onChange={setSla}
              options={['All', 'Breached', 'Within SLA', '40m left', '1h left', '3h left']}
            />
            <AdminFilter label="Created" value="All time" onChange={() => undefined} options={['All time']} />
            <AdminFilter value="Sort: SLA urgency" onChange={() => undefined} options={['Sort: SLA urgency']} />
          </div>
        </div>
      }
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <AdminDataTable
          embedded
          tall
          rows={filtered}
          pageSize={8}
          noun="tickets"
          grid="0.55fr 1.1fr 1.45fr 0.75fr 0.7fr 1fr 0.85fr 0.6fr 0.6fr 0.9fr 52px"
          actionLabel="Open"
          onRow={(r) => navigate(`/admin/support/${r.id}`)}
          columns={[
            { header: 'Ticket', render: (r) => <span className="font-medium text-[#480516]">{r.id}</span> },
            {
              header: 'Buyer',
              render: (r) => (
                <span className="flex items-center gap-1.5">
                  <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[#f4f0f1] text-[10px] font-semibold text-[#480516]">
                    {initials(r.buyer)}
                  </span>
                  <span className="truncate">{r.buyer}</span>
                </span>
              ),
            },
            { header: 'Subject', render: (r) => <span className="line-clamp-2">{r.subject}</span> },
            { header: 'Category', render: (r) => r.category },
            { header: 'Priority', render: (r) => <StatusCell status={r.priority} /> },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
            { header: 'SLA', render: (r) => <StatusCell status={r.sla} /> },
            { header: 'Created', render: (r) => r.created },
            { header: 'Updated', render: (r) => r.updated },
            {
              header: 'Assigned',
              render: (r) => (
                <span className={r.assignee === 'Unassigned' ? 'text-slate-400' : 'text-slate-600'}>{r.assignee}</span>
              ),
            },
          ]}
        />
      </div>
    </AdminListShell>
  )
}

export function TicketDetail({ item }: { item: AdminTicket }) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [modal, setModal] = useState<ModalKind>(null)
  const [reply, setReply] = useState('')
  const [assignee, setAssignee] = useState(item.assignee === 'Unassigned' ? 'Ops Admin' : item.assignee)
  const [nextStatus, setNextStatus] = useState(item.status)
  const [statusNote, setStatusNote] = useState('')
  const [resolution, setResolution] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    setAssignee(item.assignee === 'Unassigned' ? 'Ops Admin' : item.assignee)
    setNextStatus(item.status)
    setStatusNote('')
    setResolution('')
    setNote('')
    setReply('')
    setModal(null)
  }, [item.id, item.assignee, item.status])

  const slaBadge = item.sla
  const isOpenLike = item.status === 'Open' || item.status === 'In Progress' || item.status === 'Waiting for Buyer'
  const isResolved = item.status === 'Resolved'
  const isClosed = item.status === 'Closed'

  const optionClass = (selected: boolean) =>
    cn(
      'rounded-lg border px-3.5 py-2 text-[12px] font-medium transition-colors',
      selected
        ? 'border-[1.5px] border-[#a7878f] bg-[#f4f0f1] text-[#480516]'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
    )

  const setExtra = (
    status: string,
    extra?: Record<string, string>,
    toast?: string,
    historyTitle?: string,
  ) => {
    dispatch(
      setRecordStatus({
        collection: 'tickets',
        id: item.id,
        status,
        extra,
        historyTitle,
      }),
    )
    if (toast) dispatch(showToast(toast))
    setModal(null)
  }

  return (
    <div className="flex w-full max-w-full flex-col gap-4 animate-fade-in sm:gap-5">
      <AdminBack label="Back to Support" onClick={() => navigate('/admin/support')} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-slate-900">{item.id}</h1>
            <AdminBadge status={item.status} />
            <AdminBadge status={slaBadge} />
          </div>
          <p className="mt-1 text-[15px] font-medium text-slate-800">{item.subject}</p>
          <p className="mt-0.5 text-[13.5px] text-slate-500">
            {item.buyer} · {item.category} · {priorityLabel(item.priority)} ·{' '}
            {item.assignee === 'Unassigned' ? 'Unassigned' : `Assigned to ${item.assignee}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOpenLike ? (
            <>
              <AdminButton variant="outline" onClick={() => setModal('assign')}>
                Assign
              </AdminButton>
              <AdminButton variant="outline" onClick={() => setModal('status')}>
                Update Status
              </AdminButton>
              <AdminButton onClick={() => setModal('resolve')}>Resolve</AdminButton>
            </>
          ) : null}
          {isResolved ? (
            <>
              <AdminButton variant="outline" onClick={() => setModal('note')}>
                Add Note
              </AdminButton>
              <AdminButton onClick={() => setModal('close')}>Close Ticket</AdminButton>
            </>
          ) : null}
          {isClosed ? (
            <AdminButton variant="outline" onClick={() => setModal('note')}>
              Add Note
            </AdminButton>
          ) : null}
        </div>
      </div>

      {isResolved && item.resolutionNote ? (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-[13px] leading-5 text-emerald-800">
          <span className="mt-0.5 shrink-0" aria-hidden>
            ✓
          </span>
          <p>{`Resolved on ${item.resolvedAt || item.updated} by ${item.resolvedBy || item.assignee}. Resolution note: “${item.resolutionNote}”`}</p>
        </div>
      ) : null}
      {isClosed ? (
        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[13px] leading-5 text-slate-600">
          <span className="mt-0.5 shrink-0" aria-hidden>
            🔒
          </span>
          <p>This ticket was closed on {item.closedAt || item.updated}. No further replies can be sent.</p>
        </div>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-4">
        <div className="space-y-4">
          <AdminCard title="Conversation">
            <div className="space-y-4">
              {item.messages.map((m, i) => {
                const admin = m.role === 'admin'
                return (
                  <div key={`${m.at}-${i}`} className={cn('flex gap-2.5', admin ? 'flex-row-reverse' : 'flex-row')}>
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                        admin ? 'bg-[#f4f0f1] text-[#480516]' : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {initials(m.from)}
                    </span>
                    <div className={cn('max-w-[85%] space-y-1', admin ? 'items-end text-right' : '')}>
                      <div
                        className={cn(
                          'rounded-xl px-3.5 py-2.5 text-left text-[13px] leading-5 text-slate-700',
                          admin ? 'bg-[#f8f1f3]' : 'bg-slate-50',
                        )}
                      >
                        {m.body}
                      </div>
                      <p className="text-[12px] text-slate-400">
                        {m.from} · {m.at}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            {isClosed ? (
              <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12.5px] text-slate-500">
                🔒 This ticket is closed. No further replies can be sent.
              </p>
            ) : null}
          </AdminCard>

          {!isClosed ? (
            <AdminCard title="Reply to buyer">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={`Write a reply to ${item.buyer}...`}
                className="min-h-[96px] w-full rounded-lg border border-slate-200 px-3 py-2 text-[13.5px] outline-none placeholder:text-slate-400"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <button type="button" className="text-[13px] font-medium text-slate-500 hover:text-slate-800">
                  Attach file
                </button>
                <AdminButton
                  disabled={!reply.trim()}
                  onClick={() => {
                    dispatch(replyToTicket({ id: item.id, body: reply.trim() }))
                    dispatch(showToast('Reply sent'))
                    setReply('')
                  }}
                >
                  Send Reply
                </AdminButton>
              </div>
            </AdminCard>
          ) : null}
        </div>

        <div className="space-y-4">
          <AdminCard title="Ticket information">
            <div className="space-y-3">
              <AdminKv label="Buyer" value={item.buyer} tone="strong" />
              <AdminKv label="Category" value={item.category} />
              <AdminKv label="Priority" value="" badge={item.priority} />
              <AdminKv label="Created" value={item.opened || item.created} />
              <AdminKv label="Last updated" value={item.lastReply || item.updated} />
              <AdminKv label="Assigned to" value={item.assignee} tone="strong" />
            </div>
          </AdminCard>

          {item.sla === 'Breached' || item.slaPastDeadline ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-[13.5px] font-semibold text-slate-800">SLA status</p>
                <AdminBadge status={item.sla} />
              </div>
              <p className="text-[18px] font-semibold text-red-600">{item.slaPastDeadline || 'Past deadline'}</p>
              {item.slaDeadlineNote ? <p className="mt-1 text-[12.5px] leading-5 text-red-600/80">{item.slaDeadlineNote}</p> : null}
            </div>
          ) : null}

          <AdminCard title="Ticket history">
            <ol className="space-y-3.5">
              {item.history.map((entry, index) => (
                <li key={`${entry.title}-${entry.at}-${index}`} className="flex gap-3">
                  <span className="flex w-2.5 shrink-0 flex-col items-center">
                    <span className="mt-1.5 size-2 rounded-full bg-slate-300" />
                    {index < item.history.length - 1 ? <span className="mt-1 w-px flex-1 bg-slate-200" /> : null}
                  </span>
                  <div className="min-w-0 pb-1">
                    <p className="text-[13px] font-medium text-slate-800">{entry.title}</p>
                    <p className="mt-0.5 text-[12px] text-slate-400">
                      {entry.at} · {entry.actor}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </AdminCard>

          {item.notes.length > 0 ? (
            <AdminCard title="Internal notes">
              <div className="space-y-3">
                {item.notes.map((n) => (
                  <div key={n.id} className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[13px] text-slate-800">{n.body}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {n.author} · {n.at}
                    </p>
                  </div>
                ))}
              </div>
            </AdminCard>
          ) : null}
        </div>
      </div>

      {modal === 'assign' ? (
        <AdminModal
          title="Assign Ticket"
          subtitle={`Reassign ticket ${item.id}. Currently assigned to ${item.assignee}.`}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton onClick={() => setExtra(item.status, { assignee }, 'Ticket assigned', `Assigned to ${assignee}`)}>
                Assign Ticket
              </AdminButton>
            </>
          }
        >
          <p className="mb-2 text-[12px] font-medium text-slate-600">Assign to</p>
          <div className="flex flex-wrap gap-2">
            {ASSIGNEES.map((name) => (
              <button key={name} type="button" onClick={() => setAssignee(name)} className={optionClass(assignee === name)}>
                {name}
              </button>
            ))}
          </div>
        </AdminModal>
      ) : null}

      {modal === 'status' ? (
        <AdminModal
          title="Update Status"
          subtitle={`Change the status of ticket ${item.id}. This is recorded in the ticket history.`}
          maxWidth={460}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                onClick={() => {
                  if (nextStatus === 'Resolved') {
                    setModal('resolve')
                    return
                  }
                  const extra: Record<string, string> = {}
                  if (statusNote.trim()) extra.statusNote = statusNote.trim()
                  if (nextStatus === 'Closed') extra.closedAt = formatClosedAt()
                  setExtra(
                    nextStatus,
                    Object.keys(extra).length ? extra : undefined,
                    `Status updated to ${nextStatus}`,
                  )
                  setStatusNote('')
                }}
              >
                Update Status
              </AdminButton>
            </>
          }
        >
          <p className="mb-2 text-[12px] font-medium text-slate-600">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((statusOption) => (
              <button
                key={statusOption}
                type="button"
                onClick={() => setNextStatus(statusOption)}
                className={optionClass(nextStatus === statusOption)}
              >
                {statusOption}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-[12px] font-medium text-slate-600">
            Note (optional)
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Waiting on buyer to confirm transaction reference"
              className="mt-1.5 min-h-[60px] w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[12.5px] font-normal outline-none placeholder:text-slate-400"
            />
          </label>
        </AdminModal>
      ) : null}

      {modal === 'resolve' ? (
        <AdminModal
          title="Resolve Ticket"
          maxWidth={440}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                disabled={!resolution.trim()}
                onClick={() =>
                  setExtra(
                    'Resolved',
                    {
                      resolutionNote: resolution.trim(),
                      resolvedAt: new Date().toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }),
                      resolvedBy: 'Ops Admin',
                      sla: 'Within SLA',
                    },
                    'Ticket resolved',
                  )
                }
              >
                Resolve Ticket
              </AdminButton>
            </>
          }
        >
          <p className="mb-4 text-[12px] leading-normal text-emerald-700">
            This marks {item.id} as Resolved. The buyer will be able to see the resolution note.
          </p>
          <label className="block text-[12px] font-medium text-slate-600">
            Resolution note (required)
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="e.g. Confirmed payment reference TXN-88213 was received before the deadline; hold reinstated."
              className="mt-1.5 min-h-[70px] w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[12.5px] font-normal outline-none placeholder:text-slate-400"
            />
          </label>
        </AdminModal>
      ) : null}

      {modal === 'close' ? (
        <AdminModal
          title="Close Ticket"
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton onClick={() => setExtra('Closed', { closedAt: formatClosedAt() }, 'Ticket closed')}>
                Close Ticket
              </AdminButton>
            </>
          }
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-[14px] leading-none" aria-hidden>
              🔒
            </span>
            <p className="text-[12px] leading-normal text-slate-600">
              {item.id} will be closed. No further replies can be sent once a ticket is closed.
            </p>
          </div>
        </AdminModal>
      ) : null}

      {modal === 'note' ? (
        <AdminModal
          title="Add Note"
          subtitle="Internal note — not visible to the buyer."
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                disabled={!note.trim()}
                onClick={() => {
                  dispatch(addAdminNote({ collection: 'tickets', id: item.id, body: note.trim() }))
                  dispatch(showToast('Note added'))
                  setNote('')
                  setModal(null)
                }}
              >
                Add Note
              </AdminButton>
            </>
          }
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an internal note…"
            className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13.5px] outline-none placeholder:text-slate-400"
          />
        </AdminModal>
      ) : null}
    </div>
  )
}
