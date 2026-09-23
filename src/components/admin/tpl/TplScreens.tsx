import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AdminButton,
  AdminCard,
  AdminFilter,
  AdminKv,
  AdminModal,
  AdminSearch,
} from '@/components/admin/ui'
import {
  AdminDataTable,
  AdminDetailShell,
  AdminListShell,
  AdminNotFound,
  AdminTablePanel,
  HistoryPanel,
  StatusCell,
  TwoCol,
  matchesQuery,
} from '@/components/admin/screens'
import { Icon } from '@/components/shared/Icon'
import { adminIcons } from '@/assets/admin'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setRecordStatus } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'

function maskImei(imei: string) {
  if (imei.length < 4) return imei
  return `•••• ${imei.slice(-4)}`
}

function PhotoGrid({ photos }: { photos: { label: string; empty?: boolean }[] }) {
  return (
    <AdminCard title="Intake Photos" className="w-full">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.label} className="flex flex-col gap-1.5">
            <div
              className={`flex h-[90px] items-center justify-center rounded-lg border border-slate-200 ${
                photo.empty ? 'bg-white' : 'bg-slate-50'
              }`}
            >
              {photo.empty ? null : <Icon src={adminIcons.filePreview} size={28} />}
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11.5px] leading-[normal] text-slate-500">{photo.label}</p>
              {!photo.empty ? (
                <button
                  type="button"
                  aria-label={`View ${photo.label}`}
                  className="flex size-3 shrink-0 items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <Icon src={adminIcons.view} size={12} />
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

function PhonecheckBanner({
  result,
  detail,
}: {
  result: 'Passed' | 'Failed'
  detail: string
}) {
  const ok = result === 'Passed'
  return (
    <div
      className={`w-full rounded-lg border px-4 py-3.5 ${
        ok ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon src={ok ? adminIcons.check : adminIcons.reject} size={16} />
        <p className={`text-[13px] font-medium leading-[normal] ${ok ? 'text-emerald-700' : 'text-red-700'}`}>
          Phonecheck result: {result}
        </p>
      </div>
      <p className={`mt-1.5 text-[12px] leading-[normal] ${ok ? 'text-emerald-700' : 'text-red-700'}`}>{detail}</p>
    </div>
  )
}

function DetailBox({ rows }: { rows: { label: string; value: string; tone?: 'success' | 'danger' }[] }) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-[10px] bg-slate-50 px-4 py-3.5 text-[12.5px] leading-[normal]">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-3">
          <span className="text-slate-500">{row.label}</span>
          <span
            className={
              row.tone === 'success'
                ? 'font-medium text-emerald-700'
                : row.tone === 'danger'
                  ? 'font-medium text-red-700'
                  : 'font-medium text-slate-800'
            }
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function TplList() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.tpl)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [sort, setSort] = useState('Pending first')

  const filtered = useMemo(() => {
    const list = rows.filter(
      (r) =>
        matchesQuery(`${r.orderId} ${r.buyer} ${r.product} ${r.imei} ${r.serial}`, query) &&
        (status === 'All statuses' || r.status === status),
    )
    return [...list].sort((a, b) => {
      if (sort === 'Oldest first') return a.submitted.localeCompare(b.submitted)
      if (sort === 'Newest first') return b.submitted.localeCompare(a.submitted)
      // Pending first — preserve Figma queue order from fixtures
      return rows.indexOf(a) - rows.indexOf(b)
    })
  }, [rows, query, status, sort])

  return (
    <AdminListShell
      title="3PL Verification"
      subtitle="Orders with Aquantuo warehouse photos needing IMEI/Serial Number check."
    >
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch
              className="min-w-0 flex-1"
              value={query}
              onChange={setQuery}
              placeholder="Search by order, buyer, or IMEI/Serial"
            />
            <AdminFilter
              value={status}
              onChange={setStatus}
              options={['All statuses', 'Pending Verification', 'Failed / Requires Review', 'Verified at US 3PL']}
            />
            <AdminFilter value="Date range" onChange={() => undefined} options={['Date range']} />
            <AdminFilter
              value={sort}
              onChange={setSort}
              options={['Pending first', 'Newest first', 'Oldest first']}
            />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={filtered}
          pageSize={8}
          grid="0.75fr 0.9fr 1.15fr 0.75fr 1.1fr 0.8fr 72px"
          actionLabel="Open"
          onRow={(r) => navigate(`/admin/3pl-verification/${r.id}`)}
          columns={[
            {
              header: 'Order ID',
              render: (r) => <span className="font-medium text-[#480516]">{r.orderId}</span>,
            },
            { header: 'Buyer', render: (r) => r.buyer },
            { header: 'Product / Lot', render: (r) => r.product },
            { header: 'IMEI / Serial', render: (r) => maskImei(r.imei) },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
            { header: 'Submitted', render: (r) => r.submitted },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function TplDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.tpl.find((r) => r.id === id))
  const [imei, setImei] = useState(item?.imei ?? '')
  const [serial, setSerial] = useState(item?.serial ?? '')
  const [phonecheck, setPhonecheck] = useState(item?.phonecheck ?? { result: null as 'Passed' | 'Failed' | null, detail: '' })
  const [modal, setModal] = useState(false)

  useEffect(() => {
    if (!item) return
    setImei(item.imei)
    setSerial(item.serial)
    setPhonecheck(item.phonecheck)
    setModal(false)
  }, [item])

  if (!item) return <AdminNotFound label="Back to 3PL verification" to="/admin/3pl-verification" />

  const pending = item.status === 'Pending Verification'
  const failed = item.status === 'Failed / Requires Review'
  const verified = item.status === 'Verified at US 3PL'

  const markVerified = () => {
    dispatch(
      setRecordStatus({
        collection: 'tpl',
        id: item.id,
        status: 'Verified at US 3PL',
        extra: {
          banner: 'Verified at US 3PL. This order continues to shipping.',
        },
      }),
    )
    dispatch(showToast('Verified at US 3PL'))
    setModal(false)
  }

  return (
    <AdminDetailShell
      backLabel="Back to 3PL verification"
      onBack={() => navigate('/admin/3pl-verification')}
      title={item.orderId}
      badge={item.status}
      subtitle={`${item.buyer} · ${item.product} · Submitted ${item.submitted}`}
      actions={
        pending ? (
          <AdminButton onClick={() => setModal(true)} disabled={phonecheck.result !== 'Passed'}>
            Mark Verified at US 3PL
          </AdminButton>
        ) : failed ? (
          <>
            <AdminButton
              variant="outline"
              onClick={() => {
                setPhonecheck({
                  result: 'Passed',
                  detail: 'Device functional, no blacklist record, matches listing grade.',
                })
                dispatch(showToast('Phonecheck re-run completed'))
              }}
            >
              Retry Phonecheck
            </AdminButton>
            <AdminButton
              variant="dangerOutline"
              onClick={() => {
                dispatch(showToast('Escalated to support'))
                navigate('/admin/support')
              }}
            >
              Escalate to Support
            </AdminButton>
          </>
        ) : verified ? (
          <AdminButton variant="outline" onClick={() => navigate(`/admin/orders/${item.orderId}`)}>
            View Order
          </AdminButton>
        ) : undefined
      }
    >
      {failed && item.banner ? (
        <div className="w-full rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
          <p className="text-[12.5px] font-normal leading-[18px] text-red-700">{item.banner}</p>
        </div>
      ) : null}
      {verified ? (
        <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
          <p className="text-[12.5px] font-normal leading-[18px] text-emerald-700">
            {item.banner ?? 'Verified at US 3PL. This order continues to shipping.'}
          </p>
        </div>
      ) : null}

      <TwoCol>
        <AdminCard title="Order Information" className="space-y-3">
          <AdminKv label="Order ID" value={item.orderId} />
          <AdminKv label="Buyer" value={item.buyer} />
          <AdminKv label="Product / Lot" value={item.product} />
          <AdminKv label="Current Status" badge={item.status} />
        </AdminCard>
        <AdminCard title="Aquantuo Warehouse Information" className="space-y-3">
          <AdminKv label="Suite ID" value={item.suiteId} />
          <AdminKv label="Warehouse Location" value={item.warehouseLocation} />
          <AdminKv label="Received Date" value={item.receivedAt} />
          <AdminKv label="Intake Photos" value={`${item.photoCount} uploaded`} />
        </AdminCard>
      </TwoCol>

      <PhotoGrid photos={item.photos} />

      <AdminCard title="IMEI / Serial Verification" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium leading-[normal] text-slate-600">IMEI</span>
            <input
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              readOnly={!pending}
              className="h-[34px] w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] leading-[normal] text-slate-700 outline-none read-only:bg-slate-50"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium leading-[normal] text-slate-600">Serial Number</span>
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              readOnly={!pending}
              className="h-[34px] w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] leading-[normal] text-slate-700 outline-none read-only:bg-slate-50"
            />
          </label>
        </div>
        {pending ? (
          <AdminButton
            variant="outline"
            onClick={() => {
              setPhonecheck({
                result: 'Passed',
                detail: 'Device functional, no blacklist record, matches listing grade.',
              })
              dispatch(showToast('Phonecheck completed'))
            }}
          >
            Run Phonecheck
          </AdminButton>
        ) : null}
        {phonecheck.result ? <PhonecheckBanner result={phonecheck.result} detail={phonecheck.detail} /> : null}
      </AdminCard>

      <HistoryPanel title="Verification History" items={item.history} />

      {modal ? (
        <AdminModal
          title="Mark Verified at US 3PL"
          subtitle="Confirms the device passed Phonecheck and matches the listing. The order will continue to shipping."
          maxWidth={440}
          onClose={() => setModal(false)}
          icon={<Icon src={adminIcons.check} size={18} />}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(false)}>
                Cancel
              </AdminButton>
              <AdminButton onClick={markVerified}>Mark Verified at US 3PL</AdminButton>
            </>
          }
        >
          <DetailBox
            rows={[
              { label: 'Order ID', value: item.orderId },
              { label: 'IMEI', value: imei || item.imei },
              { label: 'Serial Number', value: serial || item.serial },
              {
                label: 'Phonecheck Result',
                value: phonecheck.result ?? '—',
                tone: phonecheck.result === 'Passed' ? 'success' : phonecheck.result === 'Failed' ? 'danger' : undefined,
              },
            ]}
          />
        </AdminModal>
      ) : null}
    </AdminDetailShell>
  )
}

export function TplListPage() {
  return <TplList />
}

export function TplDetailPage() {
  return <TplDetail />
}
