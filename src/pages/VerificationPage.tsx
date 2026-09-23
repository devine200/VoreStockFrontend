import { FormEvent, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/shared/Button'
import { Icon } from '@/components/shared/Icon'
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

const LIMITS = [
  {
    label: 'Bid limit',
    value: formatMoney(50000),
    foot: `→ ${formatMoney(500000)} after KYB`,
    valueClass: 'text-[#1a1e26]',
  },
  {
    label: 'Daily withdrawal',
    value: formatMoney(25000),
    foot: `→ ${formatMoney(150000)} after KYB`,
    valueClass: 'text-[#1a1e26]',
  },
  {
    label: 'Crypto deposits',
    value: 'Enabled',
    foot: 'No change',
    valueClass: 'text-[#0a6e38]',
  },
]

function StatusPill({ status }: { status: StepStatus | 'review' }) {
  const map = {
    verified: { label: 'Verified', className: 'bg-[#e8f6ee] text-[#0a6e38]' },
    pending: { label: 'Pending', className: 'bg-[#fff6e5] text-[#b45309]' },
    unverified: { label: 'Unverified', className: 'bg-[#f3f4f6] text-[#6b7280]' },
    review: { label: 'In review', className: 'bg-[#fff6e5] text-[#b45309]' },
  }
  const tone = map[status]
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium leading-[17px]', tone.className)}>
      {tone.label}
    </span>
  )
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'verified') {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8f6ee]">
        <Icon src={checkCircleIcon} size={16} />
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fff6e5]">
        <Icon src={clockIcon} size={14} />
      </span>
    )
  }
  return <span className="size-5 shrink-0 rounded-full border-2 border-[#d1d5db] bg-white" />
}

const fieldClass =
  'mt-1.5 h-[42px] w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516]'

export function VerificationPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.session.user)
  const completedSteps = CHECKLIST.filter((s) => s.status === 'verified').length
  const totalSteps = CHECKLIST.length
  const progressPct = Math.round((completedSteps / totalSteps) * 100)
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileTarget, setFileTarget] = useState<string | null>(null)

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
    if (item.action === 'complete') {
      dispatch(showToast('Owner confirmation form opened'))
      return
    }
    setFileTarget(item.id)
    fileRef.current?.click()
  }

  const onFilePicked = (file?: File) => {
    if (!file) return
    const label = fileTarget === 'settlement' ? 'Settlement account document' : 'Replacement document'
    dispatch(showToast(`${label} “${file.name}” ready to submit`))
    setFileTarget(null)
  }

  const checklist = (
    <section className="order-1 overflow-hidden rounded-2xl border border-[#ebebec] bg-white p-5 sm:p-6 lg:order-none">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Verification checklist</h2>
        <p className="shrink-0 text-[13px] text-[#9ca3af]">
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
              className={cn('h-2 w-2 rounded-full', i < completedSteps ? 'bg-[#480516]' : 'bg-[#d1d5db]')}
            />
          ))}
        </div>
      </div>
      <div className="mt-5 divide-y divide-[#ebebec]">
        {CHECKLIST.map((item) => (
          <div key={item.id} className="flex items-start gap-3 py-3.5">
            <span className="mt-0.5">
              <StepIcon status={item.status} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[14px] font-medium leading-5 text-[#1a1e26]">{item.title}</p>
                <StatusPill status={item.status} />
              </div>
              <p className="mt-0.5 text-[12px] leading-[18px] text-[#9ca3af]">{item.detail}</p>
              {item.action ? (
                <button
                  type="button"
                  onClick={() => onAction(item)}
                  className="mt-2 inline-flex h-[30px] items-center gap-1.5 rounded-xl border border-[#ebebec] bg-white px-3 text-[12px] font-medium text-[#46494f] hover:bg-[#f8f8f9]"
                >
                  {item.action === 'complete' ? (
                    '+ Complete'
                  ) : (
                    <>
                      <Icon src={uploadIcon} size={13} />
                      {item.action === 'replace' ? 'Replace' : 'Upload'}
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )

  const business = (
    <section className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Business details (KYB)</h2>
      <p className="mt-1 text-[13px] leading-4 text-[#9ca3af]">Used for invoicing, customs and escrow contracts.</p>
      <form onSubmit={saveBusiness} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-[12px] font-medium text-[#4b5563]">
            Legal entity name
            <input value={legalName} onChange={(e) => setLegalName(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-[12px] font-medium text-[#4b5563]">
            Registration number
            <input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-[12px] font-medium text-[#4b5563]">
            Tax ID / TIN
            <input value={taxId} onChange={(e) => setTaxId(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-[12px] font-medium text-[#4b5563]">
            Jurisdiction
            <input value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className={fieldClass} />
          </label>
        </div>
        <Button type="submit" className="h-10 w-full">
          Save business details
        </Button>
      </form>
    </section>
  )

  const limits = (
    <section className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Account limits</h2>
      <p className="mt-1 text-[13px] leading-4 text-[#9ca3af]">Current limits — unlock more by completing KYB</p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-[#ebebec]">
        {LIMITS.map((row) => (
          <div
            key={row.label}
            className="rounded-xl bg-[#f8f8f9] px-4 py-3 lg:rounded-none lg:bg-transparent lg:px-0 lg:py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-[#1a1e26]">{row.label}</p>
                <p className="mt-0.5 text-[12px] text-[#9ca3af]">{row.foot}</p>
              </div>
              <p className={cn('shrink-0 text-[15px] font-semibold tabular-nums', row.valueClass)}>{row.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )

  const documents = (
    <section className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Submitted documents</h2>
        <button
          type="button"
          onClick={() => {
            setFileTarget('upload')
            fileRef.current?.click()
          }}
          className="inline-flex h-[30px] items-center gap-1.5 rounded-xl border border-[#ebebec] bg-white px-3 text-[12px] font-medium text-[#46494f] hover:bg-[#f8f8f9]"
        >
          <Icon src={uploadIcon} size={13} /> Upload
        </button>
      </div>
      <div className="mt-4 divide-y divide-[#ebebec]">
        {DOCUMENTS.map((doc) => (
          <div key={doc.name} className="flex items-center gap-3 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f8f8f9] text-[#480516]">
              <Icon src={fileIcon} size={18} />
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
  )

  const help = (
    <section className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white p-5 sm:p-6">
      <div className="flex gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f8f8f9] text-[15px] font-semibold text-[#7a7b7c]">
          ?
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-[#1a1e26]">Need help with verification?</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-[#7a7b7c]">
            Our compliance team reviews documents within 1–2 business days. If a document is rejected, you can
            re-upload a clearer version.
          </p>
          <Link to="/support" className="mt-3 inline-block text-[13px] font-medium text-[#480516] hover:underline">
            Contact support →
          </Link>
        </div>
      </div>
    </section>
  )

  return (
    <div className="animate-fade-in min-w-0 space-y-6">
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => {
          onFilePicked(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">Verification</h1>
          <p className="pt-1 text-[14px] leading-5 text-[#7a7b7c]">KYC and KYB status, documents and limits</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-[35px] items-center gap-1.5 rounded-full bg-[#e8f6ee] px-3.5 text-[13px] font-medium text-[#0a6e38]">
            <span aria-hidden>✓</span> KYC Verified
          </span>
          <span className="inline-flex h-[35px] items-center rounded-full bg-[#fff6e5] px-3.5 text-[13px] font-medium text-[#b45309]">
            KYB Pending
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#f2d9a8] bg-[#fff8e6] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff1cc] text-[#b45309]">
            <Icon src={clockIcon} size={20} />
          </span>
          <div>
            <p className="text-[14px] font-semibold leading-5 text-[#1a1e26]">Business verification in review</p>
            <p className="mt-0.5 text-[13px] leading-5 text-[#5c4a1f]">
              Your KYC is complete. KYB documents are being reviewed — this usually takes 1–2 business days. You can
              continue bidding on KYC-only lots while you wait.
            </p>
          </div>
        </div>
        <span className="inline-flex h-6 shrink-0 items-center self-start rounded-full bg-[#fff1cc] px-3 text-[12px] font-semibold text-[#b45309] sm:self-center">
          Pending
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,630px)_minmax(0,1fr)] lg:items-start">
        <div className="contents lg:flex lg:flex-col lg:gap-5">
          {checklist}
          <div className="order-4 lg:contents">{business}</div>
        </div>
        <div className="contents lg:flex lg:flex-col lg:gap-5">
          <div className="order-2 lg:contents">{limits}</div>
          <div className="order-3 lg:contents">{documents}</div>
          <div className="order-5 lg:contents">{help}</div>
        </div>
      </div>
    </div>
  )
}
