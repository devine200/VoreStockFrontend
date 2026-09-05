import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/shared/Button'
import { Icon } from '@/components/shared/Icon'
import { PageHeader } from '@/components/shared/PageChrome'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { showSuccess, showToast } from '@/store/slices/uiSlice'
import { cn, formatMoney } from '@/utils/format'
import clockIcon from '@/assets/icons/clock.svg'
import fileIcon from '@/assets/icons/file.svg'
import uploadIcon from '@/assets/icons/upload.svg'
import checkCircleIcon from '@/assets/icons/check-circle.svg'

type StepStatus = 'verified' | 'pending' | 'unverified'

type ChecklistItem = {
  id: string
  title: string
  detail: string
  status: StepStatus
  action?: 'replace' | 'complete' | 'upload'
}

const CHECKLIST: ChecklistItem[] = [
  {
    id: 'identity',
    title: 'Identity document',
    detail: 'Passport verified 14 Mar 2026',
    status: 'verified',
  },
  {
    id: 'liveness',
    title: 'Liveness & selfie match',
    detail: 'Matched',
    status: 'verified',
  },
  {
    id: 'address',
    title: 'Proof of address',
    detail: 'Utility bill accepted',
    status: 'verified',
  },
  {
    id: 'registration',
    title: 'Business registration (KYB)',
    detail: 'CAC certificate under review',
    status: 'pending',
    action: 'replace',
  },
  {
    id: 'ubo',
    title: 'Ultimate beneficial owners',
    detail: '1 of 2 owners confirmed',
    status: 'pending',
    action: 'complete',
  },
  {
    id: 'settlement',
    title: 'Settlement account',
    detail: 'Not started',
    status: 'unverified',
    action: 'upload',
  },
]

const DOCUMENTS = [
  { name: 'Passport.pdf', detail: 'Verified 14 Mar', status: 'verified' as const },
  { name: 'Utility-bill.pdf', detail: 'Verified 14 Mar', status: 'verified' as const },
  { name: 'CAC-certificate.pdf', detail: undefined, status: 'review' as const },
]

function StatusPill({ status }: { status: StepStatus | 'review' }) {
  const map = {
    verified: { label: 'Verified', className: 'bg-[#e8f6ee] text-[#1f7a45]' },
    pending: { label: 'Pending', className: 'bg-[#fff6e5] text-[#b45309]' },
    unverified: { label: 'Unverified', className: 'bg-[#f3f4f6] text-[#6b7280]' },
    review: { label: 'In review', className: 'bg-[#fff6e5] text-[#b45309]' },
  }
  const tone = map[status]
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', tone.className)}>
      {tone.label}
    </span>
  )
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'verified') {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8f6ee]">
        <Icon src={checkCircleIcon} size={16} />
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fff6e5]">
        <Icon src={clockIcon} size={16} />
      </span>
    )
  }
  return <span className="h-8 w-8 shrink-0 rounded-full border-2 border-[#d1d5db] bg-white" />
}

function DocIcon() {
  return <Icon src={fileIcon} size={18} />
}

function UploadIcon() {
  return <Icon src={uploadIcon} size={14} />
}

export function VerificationPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.session.user)
  const completedSteps = CHECKLIST.filter((s) => s.status === 'verified').length
  const totalSteps = CHECKLIST.length
  const progressPct = Math.round((completedSteps / totalSteps) * 100)

  const [legalName, setLegalName] = useState(user?.company ?? 'Northbridge Trading Ltd')
  const [regNumber, setRegNumber] = useState('RC-1487203')
  const [taxId, setTaxId] = useState('20481923-0001')
  const [jurisdiction, setJurisdiction] = useState('Nigeria')

  const saveBusiness = (e: FormEvent) => {
    e.preventDefault()
    dispatch(
      showSuccess({
        title: 'Preference Saved',
        body: 'Your preference has been saved.',
        actionLabel: 'Done',
      }),
    )
  }

  const onAction = (item: ChecklistItem) => {
    const labels = {
      replace: 'Select a replacement document to upload',
      complete: 'Owner confirmation form opened',
      upload: 'Select a settlement account document to upload',
    }
    dispatch(showToast(labels[item.action!]))
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Verification"
        subtitle="KYC and KYB status, documents and limits"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f6ee] px-3 py-1.5 text-[13px] font-medium text-[#1f7a45]">
              <span aria-hidden>✓</span> KYC Verified
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff6e5] px-3 py-1.5 text-[13px] font-medium text-[#b45309]">
              KYB Pending
            </span>
          </div>
        }
      />

      <div className="flex flex-col gap-3 rounded-xl border border-[#f2d9a8] bg-[#fff8e6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff1cc] text-[#b45309]">
            <Icon src={clockIcon} size={16} />
          </span>
          <p className="text-[14px] leading-relaxed text-[#5c4a1f]">
            <span className="font-semibold text-[#1a1e26]">Business verification in review</span>
            {' — '}
            Your KYC is complete. KYB documents are being reviewed — this usually takes 1–2 business days. You
            can continue bidding on KYC-only lots while you wait.
          </p>
        </div>
        <span className="shrink-0 text-[13px] font-semibold text-[#b45309]">Pending</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div className="space-y-6">
          {/* Checklist */}
          <section className="rounded-xl border border-[#ebebec] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[16px] font-semibold text-[#1a1e26]">Verification checklist</h2>
              <p className="text-[13px] text-[#9ca3af]">
                {completedSteps} of {totalSteps} steps complete
              </p>
            </div>

            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-[#ebebec]">
                <div className="h-full rounded-full bg-[#480516]" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="mt-2 flex justify-between px-0.5">
                {CHECKLIST.map((step, i) => (
                  <span
                    key={step.id}
                    className={cn(
                      'h-2 w-2 rounded-full',
                      i < completedSteps ? 'bg-[#480516]' : 'bg-[#d1d5db]',
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 divide-y divide-[#ebebec]">
              {CHECKLIST.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center gap-3 py-3.5">
                  <StepIcon status={item.status} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[#1a1e26]">{item.title}</p>
                    <p className="text-[12px] text-[#9ca3af]">{item.detail}</p>
                  </div>
                  <StatusPill status={item.status} />
                  {item.action ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => onAction(item)}
                    >
                      {item.action === 'replace' ? (
                        <>
                          <UploadIcon /> Replace
                        </>
                      ) : item.action === 'complete' ? (
                        '+ Complete'
                      ) : (
                        <>
                          <UploadIcon /> Upload
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          {/* Business details */}
          <section className="rounded-xl border border-[#ebebec] bg-white p-5 sm:p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1e26]">Business details (KYB)</h2>
            <p className="mt-1 text-[13px] text-[#9ca3af]">
              Used for invoicing, customs and escrow contracts.
            </p>
            <form onSubmit={saveBusiness} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[12px] font-medium text-[#4b5563]">
                  Legal entity name
                  <input
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516]"
                  />
                </label>
                <label className="block text-[12px] font-medium text-[#4b5563]">
                  Registration number
                  <input
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516]"
                  />
                </label>
                <label className="block text-[12px] font-medium text-[#4b5563]">
                  Tax ID / TIN
                  <input
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516]"
                  />
                </label>
                <label className="block text-[12px] font-medium text-[#4b5563]">
                  Jurisdiction
                  <input
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516]"
                  />
                </label>
              </div>
              <Button type="submit" className="w-full">
                Save business details
              </Button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          {/* Limits */}
          <section className="rounded-xl border border-[#ebebec] bg-white p-5 sm:p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1e26]">Account limits</h2>
            <p className="mt-1 text-[13px] text-[#9ca3af]">
              Current limits — unlock more by completing KYB
            </p>
            <div className="mt-4 divide-y divide-[#ebebec]">
              <div className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-[14px] font-medium text-[#1a1e26]">Bid limit</p>
                  <p className="text-[12px] text-[#9ca3af]">→ {formatMoney(500000)} after KYB</p>
                </div>
                <p className="text-[15px] font-semibold tabular-nums text-[#1a1e26]">{formatMoney(50000)}</p>
              </div>
              <div className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-[14px] font-medium text-[#1a1e26]">Daily withdrawal</p>
                  <p className="text-[12px] text-[#9ca3af]">→ {formatMoney(150000)} after KYB</p>
                </div>
                <p className="text-[15px] font-semibold tabular-nums text-[#1a1e26]">{formatMoney(25000)}</p>
              </div>
              <div className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-[14px] font-medium text-[#1a1e26]">Crypto deposits</p>
                  <p className="text-[12px] text-[#9ca3af]">No change</p>
                </div>
                <p className="text-[15px] font-semibold text-[#1f7a45]">Enabled</p>
              </div>
            </div>
          </section>

          {/* Documents */}
          <section className="rounded-xl border border-[#ebebec] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[16px] font-semibold text-[#1a1e26]">Submitted documents</h2>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => dispatch(showToast('Select a document to upload'))}
              >
                <UploadIcon /> Upload
              </Button>
            </div>
            <div className="mt-4 divide-y divide-[#ebebec]">
              {DOCUMENTS.map((doc) => (
                <div key={doc.name} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f5f6] text-[#480516]">
                    <DocIcon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-[#1a1e26]">{doc.name}</p>
                    {doc.detail ? <p className="text-[12px] text-[#9ca3af]">{doc.detail}</p> : null}
                  </div>
                  <StatusPill status={doc.status === 'review' ? 'review' : 'verified'} />
                </div>
              ))}
            </div>
          </section>

          {/* Help */}
          <section className="rounded-xl border border-[#ebebec] bg-white p-5 sm:p-6">
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f6] text-[#7a7b7c]">
                ?
              </span>
              <div>
                <h2 className="text-[15px] font-semibold text-[#1a1e26]">Need help with verification?</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-[#7a7b7c]">
                  Our compliance team reviews documents within 1–2 business days. If a document is rejected, you
                  can re-upload a clearer version.
                </p>
                <Link
                  to="/support"
                  className="mt-3 inline-block text-[13px] font-medium text-[#480516] hover:underline"
                >
                  Contact support →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
