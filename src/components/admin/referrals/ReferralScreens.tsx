import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminIcons } from '@/assets/admin'
import {
  AdminBack,
  AdminBadge,
  AdminButton,
  AdminFilter,
  AdminModal,
  AdminPagination,
  AdminRow,
  AdminSearch,
  AdminTable,
  usePaged,
} from '@/components/admin/ui'
import {
  AdminDataTable,
  AdminListShell,
  AdminNotFound,
  AdminStageTracker,
  StatusCell,
  matchesQuery,
} from '@/components/admin/screens'
import { Icon } from '@/components/shared/Icon'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  issueReferralReward,
  reverseReferralReward,
  saveReferralConfig,
} from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminReferral, AdminReferralQualificationRule } from '@/types/admin'
import { cn } from '@/utils/format'

const JOURNEY_STAGES = ['Code shared', 'Buyer signed up', 'Qualification met', 'Reward issued'] as const

function DetailKv({
  label,
  value,
  badge,
  muted,
}: {
  label: string
  value?: ReactNode
  badge?: string
  muted?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5 text-[12.5px] leading-normal sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="shrink-0 text-[12px] text-slate-500">{label}</span>
      {badge ? (
        <AdminBadge status={badge} />
      ) : (
        <span className={cn('min-w-0 break-words font-medium sm:text-right', muted ? 'font-normal text-slate-400' : 'text-slate-800')}>
          {value}
        </span>
      )}
    </div>
  )
}

function ReferralPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <p className="text-[14px] font-semibold leading-normal text-slate-800">{title}</p>
      {children}
    </div>
  )
}

function CodeCell({ code }: { code: string }) {
  return <span className="text-[10.5px] text-[#480516]">{code}</span>
}

function ReferralHistory({ items }: { items: AdminReferral['history'] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={`${item.title}-${i}`} className="flex gap-2.5">
          <Icon src={adminIcons.referralHistDot} className="mt-1 size-[7px] shrink-0" />
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-slate-700">{item.title}</p>
            <p className="text-[10.5px] text-slate-400">{item.at}</p>
            {item.detail ? <p className="mt-0.5 text-[11px] text-slate-500">{item.detail}</p> : null}
          </div>
        </div>
      ))}
    </div>
  )
}

function JourneyTracker({ step }: { step: number }) {
  return <AdminStageTracker stages={JOURNEY_STAGES} currentIndex={step} mode="inclusive" />
}

function IssueRewardModal({
  item,
  onClose,
}: {
  item: AdminReferral
  onClose: () => void
}) {
  const dispatch = useAppDispatch()
  const [note, setNote] = useState('')
  return (
    <AdminModal bare maxWidth={440} onClose={onClose} showClose={false}>
      <div className="flex flex-col gap-3.5 px-6 py-[22px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-slate-900">Issue Reward</h2>
          <button type="button" onClick={onClose} className="rounded-md p-0.5 text-slate-400 hover:bg-slate-50" aria-label="Close">
            <Icon src={adminIcons.close} size={16} />
          </button>
        </div>
        <div className="flex gap-2">
          <Icon src={adminIcons.referralBannerCheck} className="mt-0.5 size-[15px] shrink-0" />
          <p className="text-[12px] leading-normal text-emerald-700">
            This manually issues the reward for this referral. The action is recorded in the audit trail.
          </p>
        </div>
        <div className="space-y-2 rounded-lg bg-slate-50 px-3.5 py-3">
          <DetailKv label="Referral" value={item.code} />
          <DetailKv label="Referrer" value={item.referrer} />
          <DetailKv label="Reward" value={item.reward} />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-slate-600">Note (optional)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. Automation missed this reward, verified qualification manually"
            className="h-[60px] w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-[12.5px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
          />
        </label>
        <div className="flex justify-end gap-2">
          <AdminButton variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            onClick={() => {
              dispatch(issueReferralReward({ id: item.id, note: note.trim() || undefined }))
              dispatch(showToast('Reward issued'))
              onClose()
            }}
          >
            Issue Reward
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  )
}

function ReverseRewardModal({
  item,
  onClose,
}: {
  item: AdminReferral
  onClose: () => void
}) {
  const dispatch = useAppDispatch()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  return (
    <AdminModal bare maxWidth={440} onClose={onClose} showClose={false}>
      <div className="flex flex-col gap-3.5 px-6 py-[22px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-slate-900">Reverse Reward</h2>
          <button type="button" onClick={onClose} className="rounded-md p-0.5 text-slate-400 hover:bg-slate-50" aria-label="Close">
            <Icon src={adminIcons.close} size={16} />
          </button>
        </div>
        <div className="flex gap-2">
          <Icon src={adminIcons.referralWarn} className="mt-0.5 size-[15px] shrink-0" />
          <p className="max-w-[340px] text-[12px] leading-normal text-red-700">
            This reverses the {item.reward} already issued to {item.referrer} for referral {item.code}. This cannot be
            undone automatically.
          </p>
        </div>
        <div className="space-y-2 rounded-lg bg-slate-50 px-3.5 py-3">
          <DetailKv label="Referral" value={item.code} />
          <DetailKv label="Referrer" value={item.referrer} />
          <DetailKv label="Reward issued" value={item.reward} />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-slate-600">Reason for reversal (required)</span>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              setError('')
            }}
            rows={3}
            placeholder="e.g. Referred account flagged as fraudulent — self-referral detected"
            className="h-[60px] w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-[12.5px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
          />
          {error ? <p className="mt-1.5 text-[12px] text-red-600">{error}</p> : null}
        </label>
        <div className="flex justify-end gap-2">
          <AdminButton variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            variant="danger"
            onClick={() => {
              if (!reason.trim()) {
                setError('A reason is required.')
                return
              }
              dispatch(reverseReferralReward({ id: item.id, reason: reason.trim() }))
              dispatch(showToast('Reward reversed'))
              onClose()
            }}
          >
            Reverse Reward
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  )
}

export function ReferralsList() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.referrals)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [date, setDate] = useState('All time')
  const [sort, setSort] = useState('Most recent')

  const filtered = useMemo(() => {
    const list = rows.filter(
      (r) =>
        matchesQuery(`${r.referrer} ${r.buyer} ${r.code}`, query) &&
        (status === 'All' || r.qualification === status),
    )
    if (sort === 'Oldest first') return [...list].reverse()
    return list
  }, [rows, query, status, sort])

  const queueCount = rows.filter((r) => r.qualification === 'Qualified').length
  const rewardedCount = rows.filter((r) => r.qualification === 'Rewarded').length

  return (
    <AdminListShell
      title="Referrals & Rewards"
      subtitle="Monitor the referral program and issue or reverse rewards."
      actions={
        <AdminButton variant="outline" onClick={() => navigate('/admin/referrals/config')}>
          Program settings
        </AdminButton>
      }
      kpis={
        <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-3">
          <div className="flex flex-col gap-[5px] rounded-xl border border-slate-200 bg-white px-[18px] py-4">
            <p className="text-[12px] text-slate-500">Signups this month</p>
            <p className="text-[21px] font-semibold text-slate-900">{rows.length}</p>
            <p className="text-[11px] text-slate-400">via referral code</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/referrals/queue')}
            className="flex flex-col gap-[5px] rounded-xl border border-slate-200 bg-white px-[18px] py-4 text-left hover:border-slate-300"
          >
            <p className="text-[12px] text-slate-500">Qualified referrals</p>
            <p className="text-[21px] font-semibold text-slate-900">{queueCount}</p>
            <p className="text-[11px] text-slate-400">awaiting reward</p>
          </button>
          <div className="flex flex-col gap-[5px] rounded-xl border border-slate-200 bg-white px-[18px] py-4">
            <p className="text-[12px] text-slate-500">Rewards issued</p>
            <p className="text-[21px] font-semibold text-slate-900">{rewardedCount}</p>
            <p className="text-[11px] text-slate-400">this month</p>
          </div>
        </div>
      }
      toolbar={
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <AdminSearch
            className="w-full sm:w-[270px]"
            value={query}
            onChange={setQuery}
            placeholder="Search by referrer, buyer, or code"
          />
          <AdminFilter
            label="Status"
            value={status}
            onChange={setStatus}
            options={['All', 'Pending', 'Qualified', 'Rewarded', 'Reversed']}
          />
          <AdminFilter label="Date" value={date} onChange={setDate} options={['All time', 'This month', 'Last 90 days']} />
          <AdminFilter
            value={`Sort: ${sort}`}
            onChange={(v) => setSort(v.replace(/^Sort:\s*/, ''))}
            options={['Sort: Most recent', 'Sort: Oldest first']}
          />
        </div>
      }
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <AdminDataTable
          embedded
          rows={filtered}
          pageSize={8}
          noun="referrals"
          grid="1fr 1fr 0.85fr 1.05fr 1fr 52px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/referrals/${r.id}`)}
          columns={[
            {
              header: 'Referrer',
              render: (r) => <span className="font-medium text-slate-800">{r.referrer}</span>,
            },
            { header: 'Referred buyer', render: (r) => r.buyer },
            { header: 'Code', render: (r) => <CodeCell code={r.code} /> },
            { header: 'Qualification status', render: (r) => <StatusCell status={r.qualification} /> },
            {
              header: 'Reward',
              render: (r) => (
                <span className={r.reward === '—' ? 'text-slate-400' : 'text-slate-700'}>{r.reward}</span>
              ),
            },
          ]}
        />
      </div>
    </AdminListShell>
  )
}

export function RewardsQueue() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.referrals)
  const [query, setQuery] = useState('')
  const [rewardStatus, setRewardStatus] = useState('All')
  const [issueId, setIssueId] = useState<string | null>(null)

  const queue = useMemo(
    () =>
      rows.filter(
        (r) =>
          (r.qualification === 'Qualified' || r.rewardStatus === 'Pending issuance') &&
          matchesQuery(`${r.referrer} ${r.buyer} ${r.code}`, query) &&
          (rewardStatus === 'All' || r.rewardStatus === rewardStatus),
      ),
    [rows, query, rewardStatus],
  )

  const issueItem = issueId ? rows.find((r) => r.id === issueId) : null
  const paging = usePaged(queue, 8)
  const grid = '1fr 1fr 0.85fr 0.95fr 1fr 1.1fr 1.15fr'

  return (
    <div className="flex w-full max-w-full flex-col gap-3">
      <AdminBack label="Back to Referrals" onClick={() => navigate('/admin/referrals')} />
      <AdminListShell
      title="Rewards Queue"
      subtitle="Qualified referrals waiting on reward issuance, plus rewards flagged for review."
      toolbar={
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <AdminSearch
            className="w-full sm:w-[260px]"
            value={query}
            onChange={setQuery}
            placeholder="Search by referrer or buyer"
          />
          <AdminFilter
            label="Reward status"
            value={rewardStatus}
            onChange={setRewardStatus}
            options={['All', 'Pending issuance']}
          />
        </div>
      }
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-100 xl:hidden">
          {paging.slice.map((r) => (
            <div key={r.id} className="space-y-2 px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-800">{r.referrer}</p>
                  <p className="text-[12.5px] text-slate-600">{r.buyer}</p>
                  <CodeCell code={r.code} />
                </div>
                <StatusCell status={r.rewardStatus} />
              </div>
              <div className="flex gap-3 text-[11px] font-medium">
                <button type="button" className="text-[#531424]" onClick={() => setIssueId(r.id)}>
                  Issue Reward
                </button>
                <button
                  type="button"
                  className="text-slate-500"
                  onClick={() => navigate(`/admin/referrals/${r.id}`)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden xl:block">
          <AdminTable
            embedded
            grid={grid}
            headers={['Referrer', 'Referred buyer', 'Code', 'Qualification', 'Reward', 'Reward status', '']}
            footer={
              <AdminPagination
                page={paging.page}
                pages={paging.pages}
                total={paging.total}
                onPage={paging.setPage}
                noun="referrals"
              />
            }
          >
            {paging.slice.map((r) => (
              <AdminRow
                key={r.id}
                grid={grid}
                columns={[
                  <span key="ref" className="font-medium text-slate-800">
                    {r.referrer}
                  </span>,
                  r.buyer,
                  <CodeCell key="code" code={r.code} />,
                  <StatusCell key="q" status={r.qualification} />,
                  r.reward,
                  <StatusCell key="rs" status={r.rewardStatus} />,
                  <span key="acts" className="flex items-center justify-end gap-2.5 text-[11px] font-medium">
                    <button
                      type="button"
                      className="text-[#531424] hover:underline"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIssueId(r.id)
                      }}
                    >
                      Issue Reward
                    </button>
                    <button
                      type="button"
                      className="text-slate-500 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/admin/referrals/${r.id}`)
                      }}
                    >
                      View
                    </button>
                  </span>,
                ]}
              />
            ))}
          </AdminTable>
        </div>
        <div className="xl:hidden">
          <AdminPagination
            page={paging.page}
            pages={paging.pages}
            total={paging.total}
            onPage={paging.setPage}
            noun="referrals"
          />
        </div>
      </div>
      {issueItem ? <IssueRewardModal item={issueItem} onClose={() => setIssueId(null)} /> : null}
    </AdminListShell>
    </div>
  )
}

export function ReferralConfig() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const saved = useAppSelector((s) => s.admin.referralConfig)
  const audit = useAppSelector((s) => s.admin.referralAudit)
  const [enabled, setEnabled] = useState(saved.enabled)
  const [rewardAmount, setRewardAmount] = useState(saved.rewardAmount)
  const [rule, setRule] = useState<AdminReferralQualificationRule>(saved.qualificationRule)

  useEffect(() => {
    setEnabled(saved.enabled)
    setRewardAmount(saved.rewardAmount)
    setRule(saved.qualificationRule)
  }, [saved])

  const optionClass = (selected: boolean) =>
    cn(
      'rounded-lg border px-3.5 py-2.5 text-[12px] font-medium transition-colors',
      selected
        ? 'border-[1.5px] border-[#a7878f] bg-[#f4f0f1] text-[#480516]'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
    )

  const auditPaging = usePaged(audit, 8)
  const auditGrid = '1.1fr 0.9fr 0.9fr 1.1fr 1.4fr 1fr 0.9fr'

  return (
    <div className="flex w-full max-w-full flex-col gap-3">
      <AdminBack label="Back to Referrals" onClick={() => navigate('/admin/referrals')} />
      <AdminListShell
      title="Referral Config"
      subtitle="Manage referral program settings. Changes apply to new referrals only."
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-[13px] font-medium text-slate-800">Referral program enabled</p>
            <p className="text-[11.5px] text-slate-400">Buyers can share referral codes and earn rewards</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className="shrink-0"
          >
            {enabled ? (
              <Icon src={adminIcons.referralToggleOn} className="h-[22px] w-[38px]" />
            ) : (
              <span className="relative inline-flex h-[22px] w-[38px] rounded-full bg-slate-200">
                <span className="absolute left-0.5 top-0.5 size-[18px] rounded-full bg-white shadow" />
              </span>
            )}
          </button>
        </div>
        <div className="my-3 h-px bg-slate-100" />
        <label className="block">
          <span className="mb-1.5 block text-[11.5px] font-medium text-slate-600">
            Reward amount ($ wallet credit)
          </span>
          <input
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-slate-300"
          />
        </label>
        <div className="mt-4">
          <p className="mb-2 text-[11.5px] font-medium text-slate-600">Qualification rule</p>
          <div className="flex flex-wrap gap-2">
            {(['KYC + first deposit', 'First paid order'] as const).map((opt) => (
              <button key={opt} type="button" className={optionClass(rule === opt)} onClick={() => setRule(opt)}>
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5">
          <Icon src={adminIcons.referralInfo} className="mt-0.5 size-[15px] shrink-0" />
          <p className="text-[12.5px] leading-normal text-blue-700">
            Changing configuration affects new referrals only. Existing referrals keep the qualification rule that was
            active when they signed up.
          </p>
        </div>
        <div className="mt-4 flex justify-end">
          <AdminButton
            onClick={() => {
              dispatch(saveReferralConfig({ enabled, rewardAmount, qualificationRule: rule }))
              dispatch(showToast('Referral config saved'))
            }}
          >
            Save Changes
          </AdminButton>
        </div>
      </div>

      <div>
        <p className="text-[15px] font-semibold text-slate-800">Referral program audit</p>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Manual reward issuance, reversals, and configuration changes.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-100 xl:hidden">
          {auditPaging.slice.map((r) => (
            <div key={r.id} className="space-y-2 px-4 py-3.5">
              <p className="font-medium text-slate-800">{r.action}</p>
              <p className="text-[12px] text-slate-500">
                {r.referral} · {r.admin} · {r.at}
              </p>
              <p className="text-[12px] text-slate-500">{r.reason}</p>
              <p className="text-[12px] text-slate-600">
                {r.previousState} → <span className="font-medium text-slate-800">{r.newState}</span>
              </p>
            </div>
          ))}
        </div>
        <div className="hidden xl:block">
          <AdminTable
            embedded
            grid={auditGrid}
            headers={['Action', 'Referral', 'Admin', 'Date / time', 'Reason', 'Previous state', 'New state']}
            footer={
              <AdminPagination
                page={auditPaging.page}
                pages={auditPaging.pages}
                total={auditPaging.total}
                onPage={auditPaging.setPage}
                noun="entries"
              />
            }
          >
            {auditPaging.slice.map((r) => (
              <AdminRow
                key={r.id}
                grid={auditGrid}
                columns={[
                  <span key="a" className="font-medium text-slate-800">
                    {r.action}
                  </span>,
                  r.referral === '—' ? (
                    <span key="ref" className="text-[#480516]">
                      —
                    </span>
                  ) : (
                    <button
                      key="ref"
                      type="button"
                      className="text-left text-[11px] text-[#480516] hover:underline"
                      onClick={() => navigate(`/admin/referrals/${r.referral}`)}
                    >
                      {r.referral}
                    </button>
                  ),
                  r.admin,
                  <span key="at" className="text-slate-500">
                    {r.at}
                  </span>,
                  <span key="reason" className="text-slate-500">
                    {r.reason}
                  </span>,
                  <span key="prev" className="text-slate-500">
                    {r.previousState}
                  </span>,
                  <span key="next" className="font-medium text-slate-800">
                    {r.newState}
                  </span>,
                ]}
              />
            ))}
          </AdminTable>
        </div>
        <div className="xl:hidden">
          <AdminPagination
            page={auditPaging.page}
            pages={auditPaging.pages}
            total={auditPaging.total}
            onPage={auditPaging.setPage}
            noun="entries"
          />
        </div>
      </div>
    </AdminListShell>
    </div>
  )
}

export function ReferralDetail({ item }: { item: AdminReferral }) {
  const navigate = useNavigate()
  const [modal, setModal] = useState<'issue' | 'reverse' | null>(null)
  const canIssue = item.qualification === 'Qualified' || item.rewardStatus === 'Pending issuance'
  const canReverse = item.qualification === 'Rewarded'

  return (
    <div className="flex w-full max-w-full flex-col gap-[18px] animate-fade-in">
      <AdminBack label="Back to Referrals" onClick={() => navigate('/admin/referrals')} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[18px] font-semibold text-slate-900">
              {item.referrer} → {item.buyer}
            </h1>
            <AdminBadge status={item.qualification} />
          </div>
          <p className="mt-1 text-[12.5px] text-slate-500">
            Code {item.code} · Signed up {item.signupDate}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canIssue ? <AdminButton onClick={() => setModal('issue')}>Issue Reward</AdminButton> : null}
          {canReverse ? (
            <AdminButton variant="dangerOutline" onClick={() => setModal('reverse')}>
              Reverse Reward
            </AdminButton>
          ) : null}
        </div>
      </div>

      <JourneyTracker step={item.journeyStep} />

      <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        <ReferralPanel title="Referral details">
          <div className="flex flex-col gap-3">
            <DetailKv label="Referrer" value={item.referrer} />
            <DetailKv label="Referred buyer" value={item.buyer} />
            <DetailKv label="Referral code" value={item.code} />
            <DetailKv label="Signup date" value={item.signupDate} />
            <DetailKv label="Qualification status" badge={item.qualification} />
            <DetailKv label="Qualification event" value={item.qualificationEvent} />
          </div>
        </ReferralPanel>
        <ReferralPanel title="Reward">
          <div className="flex flex-col gap-3">
            {item.rewardStatus === '—' ? (
              <DetailKv label="Reward status" value="—" muted />
            ) : (
              <DetailKv label="Reward status" badge={item.rewardStatus} />
            )}
            <DetailKv label="Reward type" value={item.rewardType} />
            <DetailKv label="Reward value" value={item.rewardValue} />
            {item.issuedAt && item.rewardStatus === 'Issued' ? (
              <DetailKv label="Issued" value={item.issuedAt} />
            ) : null}
          </div>
        </ReferralPanel>
      </div>

      <ReferralPanel title="Referral history">
        <ReferralHistory items={item.history} />
      </ReferralPanel>

      {modal === 'issue' ? <IssueRewardModal item={item} onClose={() => setModal(null)} /> : null}
      {modal === 'reverse' ? <ReverseRewardModal item={item} onClose={() => setModal(null)} /> : null}
    </div>
  )
}

export function ReferralDetailGate({ id }: { id?: string }) {
  const item = useAppSelector((s) => s.admin.referrals.find((r) => r.id === id))
  if (!item) return <AdminNotFound label="Back to referrals" to="/admin/referrals" />
  return <ReferralDetail item={item} />
}
