import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/PageChrome'
import { Icon } from '@/components/shared/Icon'
import { ContractStatusBadge } from '@/components/contracts/ContractStatusBadge'
import { useAppDispatch } from '@/store/hooks'
import { signContract } from '@/store/slices/accountSlices'
import { showSuccess, showToast } from '@/store/slices/uiSlice'
import { cn } from '@/utils/format'
import type { Contract } from '@/types'
import fileIcon from '@/assets/icons/file.svg'
import arrowDownSm from '@/assets/icons/arrow-down-sm.svg'
import { icons } from '@/assets'

type AccordionKey = 'terms' | 'documents' | 'activity'

function formatContractDate(value: string) {
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime()) && /\d{4}-\d{2}/.test(value)) {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(parsed)
  }
  return value
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-t border-[#ebebec]">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-[52px] w-full items-center justify-between px-5 text-left sm:px-6"
      >
        <span className="text-[14px] font-semibold leading-5 text-[#1a1e26]">{title}</span>
        <Icon src={arrowDownSm} size={14} className={cn('transition', open ? 'rotate-180' : '')} />
      </button>
      {open ? <div className="px-5 pb-5 sm:px-6">{children}</div> : null}
    </div>
  )
}

export function ContractDetailPanel({
  contract,
  onClose,
}: {
  contract: Contract
  onClose?: () => void
}) {
  const dispatch = useAppDispatch()
  const [openSections, setOpenSections] = useState<Record<AccordionKey, boolean>>({
    terms: true,
    documents: true,
    activity: true,
  })
  const signedCount = contract.parties.filter((p) => p.signed).length

  const toggleSection = (key: AccordionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const dates = [
    ['Contract date', contract.contractDate],
    ['Effective date', contract.effectiveDate],
    ['Expiration date', contract.expirationDate],
  ] as const

  return (
    <section
      className={cn(
        'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white',
        onClose ? 'h-full' : 'h-full rounded-2xl border border-[#ebebec]',
      )}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-[#ebebec] px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 text-[13px] leading-4 text-[#7a7b7c]">
              {contract.contractNumber}
              <span className="mx-1.5 text-[#d1d5db]">·</span>
              {contract.orderId}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden sm:inline-flex">
                <ContractStatusBadge status={contract.status} />
              </span>
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
          <h2 className="mt-1 text-[16px] font-semibold leading-5 text-[#1a1e26]">{contract.title}</h2>
          <div className="mt-2 sm:hidden">
            <ContractStatusBadge status={contract.status} />
          </div>
        </div>

        <div className="grid grid-cols-3 border-b border-[#ebebec] bg-[#f8f8f9] sm:bg-white">
          {dates.map(([label, value], i) => (
            <div
              key={label}
              className={cn('px-3 py-3 sm:px-6 sm:py-4', i > 0 && 'border-l border-[#ebebec]')}
            >
              <p className="text-[10px] leading-[15px] text-[#9ca3af] sm:text-[12px]">{label}</p>
              <p className="mt-1 text-[12px] font-semibold leading-5 text-[#1a1e26] sm:text-[14px]">
                {formatContractDate(value)}
              </p>
            </div>
          ))}
        </div>

        <div className="px-5 py-5 sm:px-6">
          <p className="text-[13px] font-medium text-[#7a7b7c]">
            Parties · {signedCount}/{contract.parties.length} signed
          </p>
          <div className="mt-4 space-y-4">
            {contract.parties.map((party) => (
              <div key={party.name} className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#480516] text-[11px] font-semibold text-white">
                  {party.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-4 text-[#1a1e26]">{party.name}</p>
                  <p className="text-[12px] leading-[15px] text-[#9ca3af]">{party.role}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {party.signed ? (
                    <>
                      <p className="hidden text-[12px] text-[#9ca3af] sm:block">
                        {party.signedAt ? formatContractDate(party.signedAt) : ''}
                      </p>
                      <span className="inline-flex rounded-full bg-[#e8f6ee] px-2 py-0.5 text-[11px] font-medium text-[#0a6e38]">
                        Signed
                      </span>
                    </>
                  ) : (
                    <span className="inline-flex rounded-full bg-[#fff6e5] px-2 py-0.5 text-[11px] font-medium text-[#b45309]">
                      Awaiting
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Accordion title="Terms & Conditions" open={openSections.terms} onToggle={() => toggleSection('terms')}>
          <ol className="space-y-2 text-[13px] leading-5 text-[#4b5563]">
            {contract.terms.map((term, i) => (
              <li key={term} className="flex gap-2">
                <span className="w-4 shrink-0 text-[#7a7b7c]">{i + 1}.</span>
                <span>{term}</span>
              </li>
            ))}
          </ol>
        </Accordion>

        <Accordion title="Documents" open={openSections.documents} onToggle={() => toggleSection('documents')}>
          <div className="space-y-2">
            {contract.documents.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center gap-3 rounded-xl border border-[#ebebec] bg-[#f8f8f9] px-4 py-3"
              >
                <Icon src={fileIcon} size={13} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-[#480516]">{doc.name}</p>
                  <p className="text-[11px] text-[#9ca3af]">{doc.size}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch(showToast(`Downloading ${doc.name}`))}
                  className="shrink-0 text-[13px] font-semibold text-[#480516] hover:underline"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion title="Activity" open={openSections.activity} onToggle={() => toggleSection('activity')}>
          <ul className="space-y-3">
            {contract.activity.map((event) => (
              <li key={`${event.label}-${event.at}`} className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#480516]" />
                  <p className="text-[13px] leading-4 text-[#4b5563]">{event.label}</p>
                </div>
                <p className="shrink-0 text-[12px] text-[#9ca3af]">{formatContractDate(event.at)}</p>
              </li>
            ))}
          </ul>
        </Accordion>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 border-t border-[#ebebec] px-5 py-4 sm:px-6">
        {contract.status === 'awaiting_signature' ? (
          <Button
            className="h-[42px] px-5 text-[14px] font-semibold !bg-[#480516]"
            onClick={() => {
              dispatch(signContract(contract.id))
              dispatch(
                showSuccess({
                  title: 'Contract Signed',
                  body: 'Your signature was recorded. The agreement is now active and both parties have been notified.',
                  actionLabel: 'Done',
                }),
              )
            }}
          >
            Sign contract
          </Button>
        ) : null}
        <Button
          variant="secondary"
          className="h-[42px] border-[#ebebec] px-5 text-[14px] font-medium text-[#1a1e26]"
          onClick={() => dispatch(showToast('PDF download started'))}
        >
          Download PDF
        </Button>
        <Link to="/support">
          <Button
            variant="secondary"
            className="h-[42px] border-[#ebebec] px-5 text-[14px] font-medium text-[#1a1e26]"
          >
            Contact support
          </Button>
        </Link>
      </div>
    </section>
  )
}

export function ContractDetailEmpty() {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center rounded-2xl border border-[#ebebec] bg-white">
      <EmptyState title="Select a contract" body="Choose a contract from the list to review details." />
    </div>
  )
}
