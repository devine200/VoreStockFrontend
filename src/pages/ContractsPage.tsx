import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/shared/Button'
import { EmptyState, PageHeader } from '@/components/shared/PageChrome'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { signContract } from '@/store/slices/accountSlices'
import { showSuccess, showToast } from '@/store/slices/uiSlice'
import { cn } from '@/utils/format'
import type { Contract } from '@/types'

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

function statusLabel(status: Contract['status']) {
  switch (status) {
    case 'awaiting_signature':
      return 'Pending Signature'
    case 'active':
      return 'Active'
    case 'completed':
      return 'Completed'
    case 'draft':
      return 'Draft'
    default:
      return status
  }
}

function statusTone(status: Contract['status']) {
  switch (status) {
    case 'active':
      return 'bg-[#e8f6ee] text-[#1f7a45]'
    case 'awaiting_signature':
      return 'bg-[#fff6e5] text-[#b45309]'
    case 'completed':
      return 'bg-[#e8f1ff] text-[#1d4ed8]'
    case 'draft':
      return 'bg-[#f3f4f6] text-[#6b7280]'
    default:
      return 'bg-[#f3f4f6] text-[#6b7280]'
  }
}

function StatusPill({ status }: { status: Contract['status'] }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', statusTone(status))}>
      {statusLabel(status)}
    </span>
  )
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-5-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
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
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-[14px] font-semibold text-[#1a1e26]">{title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={cn('text-[#7a7b7c] transition', open ? 'rotate-180' : '')}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      {open ? <div className="pb-4">{children}</div> : null}
    </div>
  )
}

export function ContractsPage() {
  const dispatch = useAppDispatch()
  const contracts = useAppSelector((s) => s.contracts.items)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openSections, setOpenSections] = useState<Record<AccordionKey, boolean>>({
    terms: true,
    documents: true,
    activity: true,
  })

  const awaiting = useMemo(
    () => contracts.filter((c) => c.status === 'awaiting_signature').length,
    [contracts],
  )

  useEffect(() => {
    if (!contracts.length) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !contracts.some((c) => c.id === selectedId)) {
      setSelectedId(contracts[0].id)
    }
  }, [contracts, selectedId])

  const selected = contracts.find((c) => c.id === selectedId) ?? null
  const signedCount = selected ? selected.parties.filter((p) => p.signed).length : 0

  const toggleSection = (key: AccordionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Contracts"
        subtitle="Agreements connected to your purchases and transactions"
        actions={
          awaiting > 0 ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fff6e5] px-3 py-1.5 text-[13px] font-medium text-[#8a6116]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b45309]" />
              {awaiting} contract{awaiting === 1 ? '' : 's'} awaiting signature
            </span>
          ) : null
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="h-fit overflow-hidden rounded-xl border border-[#ebebec] bg-white">
          <div className="border-b border-[#ebebec] px-4 py-3">
            <h2 className="text-[14px] font-semibold text-[#1a1e26]">All contracts</h2>
          </div>
          {contracts.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No contracts" body="Contracts appear here after you win and settle a lot." />
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {contracts.map((c) => {
                const active = c.id === selectedId
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      'flex w-full gap-3 rounded-xl p-3 text-left transition',
                      active
                        ? 'border border-[#480516] bg-[#fdfbfb]'
                        : 'border border-transparent hover:bg-[#f9fafb]',
                    )}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f6] text-[#480516]">
                      <DocIcon />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-[#1a1e26]">
                        {c.title}
                      </p>
                      <p className="mt-1 text-[11px] text-[#9ca3af]">
                        {c.contractNumber} · {c.orderId}
                      </p>
                      <div className="mt-2">
                        <StatusPill status={c.status} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </aside>

        {/* Detail */}
        <section className="rounded-xl border border-[#ebebec] bg-white p-5 sm:p-6">
          {!selected ? (
            <EmptyState title="Select a contract" body="Choose a contract from the list to review details." />
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[12px] text-[#9ca3af]">
                    {selected.contractNumber}
                    <span className="mx-2 text-[#d1d5db]">·</span>
                    {selected.orderId}
                  </p>
                  <h2 className="mt-2 text-[20px] font-semibold leading-snug text-[#1a1e26]">
                    {selected.title}
                  </h2>
                </div>
                <StatusPill status={selected.status} />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-[#ebebec] px-4 py-4 sm:grid-cols-3">
                {(
                  [
                    ['Contract date', selected.contractDate],
                    ['Effective date', selected.effectiveDate],
                    ['Expiration date', selected.expirationDate],
                  ] as const
                ).map(([label, value], i) => (
                  <div key={label} className={cn(i > 0 && 'sm:border-l sm:border-[#ebebec] sm:pl-4')}>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[#9ca3af]">{label}</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#1a1e26]">{formatContractDate(value)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#9ca3af]">
                  Parties · {signedCount}/{selected.parties.length} signed
                </p>
                <div className="mt-3 space-y-3">
                  {selected.parties.map((party) => (
                    <div key={party.name} className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#480516] text-[12px] font-semibold text-white">
                        {party.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-[#1a1e26]">{party.name}</p>
                        <p className="text-[12px] text-[#9ca3af]">{party.role}</p>
                      </div>
                      <div className="text-right">
                        {party.signed ? (
                          <>
                            <p className="text-[11px] text-[#9ca3af]">
                              {party.signedAt ? formatContractDate(party.signedAt) : ''}
                            </p>
                            <span className="mt-0.5 inline-flex rounded-full bg-[#e8f6ee] px-2 py-0.5 text-[11px] font-medium text-[#1f7a45]">
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

              <div className="mt-6">
                <Accordion title="Terms & Conditions" open={openSections.terms} onToggle={() => toggleSection('terms')}>
                  <ol className="list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-[#4b5563]">
                    {selected.terms.map((term) => (
                      <li key={term}>{term}</li>
                    ))}
                  </ol>
                </Accordion>

                <Accordion title="Documents" open={openSections.documents} onToggle={() => toggleSection('documents')}>
                  <div className="space-y-2">
                    {selected.documents.map((doc) => (
                      <div
                        key={doc.name}
                        className="flex items-center gap-3 rounded-xl bg-[#f5f5f6] px-3 py-2.5"
                      >
                        <span className="text-[#480516]">
                          <DocIcon />
                        </span>
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
                    {selected.activity.map((event) => (
                      <li key={`${event.label}-${event.at}`} className="flex items-start justify-between gap-4">
                        <div className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#480516]" />
                          <p className="text-[13px] text-[#4b5563]">{event.label}</p>
                        </div>
                        <p className="shrink-0 text-[12px] text-[#9ca3af]">{formatContractDate(event.at)}</p>
                      </li>
                    ))}
                  </ul>
                </Accordion>
              </div>

              <div className="mt-auto flex flex-wrap gap-2 border-t border-[#ebebec] pt-5">
                {selected.status === 'awaiting_signature' ? (
                  <Button
                    onClick={() => {
                      dispatch(signContract(selected.id))
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
                  className="border-[#480516] text-[#480516]"
                  onClick={() => dispatch(showToast('PDF download started'))}
                >
                  Download PDF
                </Button>
                <Link to="/support">
                  <Button variant="secondary">Contact support</Button>
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
