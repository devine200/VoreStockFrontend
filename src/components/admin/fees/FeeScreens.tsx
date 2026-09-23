import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminBadge, AdminButton, AdminFieldRow, AdminModal } from '@/components/admin/ui'
import { AdminListShell, FieldInput } from '@/components/admin/screens'
import { cn } from '@/utils/format'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateFeeConfig } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminFeeConfig } from '@/types/admin'

type EditKey = 'buyerServiceFee' | 'overdrive' | 'bidHoldDefault' | 'bstockMarkup' | `freight:${string}`

type EditTarget = {
  key: EditKey
  label: string
  title: string
  fieldLabel: string
  current: string
  note?: string
  min?: number
  max?: number
}

function IconWrap({ children, tone = 'maroon' }: { children: ReactNode; tone?: 'maroon' | 'green' | 'blue' }) {
  const tones = {
    maroon: 'bg-[#f4f0f1] text-[#531424]',
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
  }
  return (
    <div
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-[15px] text-[15px] font-semibold',
        tones[tone],
      )}
    >
      {children}
    </div>
  )
}

function Kv({ label, value }: { label: string; value: string }) {
  return <AdminFieldRow label={label} value={value} />
}

function FeeCard({
  icon,
  iconTone = 'maroon',
  title,
  badge,
  children,
  onEdit,
}: {
  icon: ReactNode
  iconTone?: 'maroon' | 'green' | 'blue'
  title: string
  badge?: string
  children: ReactNode
  onEdit: () => void
}) {
  return (
    <div className="flex flex-col gap-2.5 overflow-hidden rounded-xl border border-slate-200 bg-white px-3.5 py-4 sm:gap-3 sm:px-5 sm:py-[18px]">
      <div className="flex flex-wrap items-center gap-2.5">
        <IconWrap tone={iconTone}>{icon}</IconWrap>
        <p className="min-w-0 flex-1 text-[14.5px] font-semibold text-slate-900">{title}</p>
        {badge ? <AdminBadge kind="info" status={badge} /> : null}
      </div>
      {children}
      <div>
        <AdminButton variant="outline" onClick={onEdit}>
          Edit
        </AdminButton>
      </div>
    </div>
  )
}

function HoldRange({ value, min, max }: { value: number; min: number; max: number }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
  return (
    <div className="w-full">
      <div className="relative h-2 w-full rounded-full bg-slate-100">
        <div className="absolute inset-y-0 left-0 rounded-full bg-[#531424]/40" style={{ width: `${pct}%` }} />
        <span
          className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-white bg-[#531424] shadow"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
        <span>{min}% min</span>
        <span>{max}% max</span>
      </div>
    </div>
  )
}

function parsePct(raw: string): number | null {
  const n = Number(String(raw).replace(/%/g, '').trim())
  return Number.isFinite(n) ? n : null
}

function formatPct(n: number): string {
  return `${n}%`.replace(/\.0%$/, '%')
}

function markupExample(markup: string): { upstream: string; buyer: string } {
  const pct = parsePct(markup) ?? 12
  return { upstream: '$100', buyer: `$${Math.round(100 * (1 + pct / 100))}` }
}

export function FeesConfig() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const config = useAppSelector((s) => s.admin.feeConfig)
  const audit = useAppSelector((s) => s.admin.feeAudit)
  const [edit, setEdit] = useState<EditTarget | null>(null)
  const [draft, setDraft] = useState('')
  const [step, setStep] = useState<'edit' | 'preview' | 'discard'>('edit')
  const [error, setError] = useState('')

  const holdValue = useMemo(() => parsePct(config.bidHoldDefault) ?? 10, [config.bidHoldDefault])
  const example = useMemo(() => markupExample(config.bstockMarkup), [config.bstockMarkup])

  const openEdit = (target: EditTarget) => {
    setEdit(target)
    setDraft(String(target.current).replace(/%/g, ''))
    setStep('edit')
    setError('')
  }

  const closeAll = () => {
    setEdit(null)
    setStep('edit')
    setError('')
    setDraft('')
  }

  const tryClose = () => {
    if (edit && draft !== String(edit.current).replace(/%/g, '') && step === 'edit') {
      setStep('discard')
      return
    }
    closeAll()
  }

  const validate = (): string | null => {
    if (!edit) return 'Missing edit target'
    if (!draft.trim()) return 'Enter a value before previewing.'
    if (edit.min != null && edit.max != null) {
      const n = parsePct(draft)
      if (n == null) return 'Value must be a valid percentage.'
      if (n < edit.min || n > edit.max) {
        return `Bid hold must remain within the allowed range of ${edit.min}% – ${edit.max}%.`
      }
    }
    return null
  }

  const goPreview = () => {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError('')
    setStep('preview')
  }

  const save = () => {
    if (!edit) return
    const err = validate()
    if (err) {
      setError(err)
      setStep('edit')
      return
    }
    const next = edit.key.startsWith('freight:')
      ? draft.trim().includes('/')
        ? draft.trim()
        : draft.trim()
      : formatPct(parsePct(draft) ?? 0)
    dispatch(
      updateFeeConfig({
        key: edit.key,
        value: next,
        label: edit.label,
        previous: edit.current,
      }),
    )
    dispatch(showToast(`${edit.label} updated`))
    closeAll()
  }

  const draftDisplay = edit?.key.startsWith('freight:')
    ? draft.trim()
    : formatPct(parsePct(draft) ?? 0)

  return (
    <AdminListShell title="Fees & Pricing" subtitle="Configure platform pricing and bidding rules.">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        <FeeCard
          icon="%"
          iconTone="maroon"
          title="Buyer service fee"
          badge="Percentage"
          onEdit={() =>
            openEdit({
              key: 'buyerServiceFee',
              label: 'Buyer service fee',
              title: 'Edit buyer service fee',
              fieldLabel: 'New fee (%)',
              current: config.buyerServiceFee,
            })
          }
        >
          <p className="text-[26px] font-semibold leading-none text-slate-900">{config.buyerServiceFee}</p>
          <Kv label="Apply on" value={config.buyerServiceApplyOn} />
        </FeeCard>

        <FeeCard
          icon="O"
          iconTone="green"
          title="Overdrive (Flex-bid)"
          onEdit={() =>
            openEdit({
              key: 'overdrive',
              label: 'Overdrive (Flex-bid)',
              title: 'Edit overdrive',
              fieldLabel: 'New default (%)',
              current: config.overdrive,
            })
          }
        >
          <p className="text-[12.5px] leading-5 text-slate-600">{config.overdriveDescription}</p>
          <Kv label="Default" value={config.overdrive} />
        </FeeCard>

        <FeeCard
          icon="%"
          iconTone="blue"
          title="Bid hold"
          onEdit={() =>
            openEdit({
              key: 'bidHoldDefault',
              label: 'Bid hold default',
              title: 'Edit bid hold',
              fieldLabel: 'New default hold (%)',
              current: config.bidHoldDefault,
              min: config.bidHoldMin,
              max: config.bidHoldMax,
            })
          }
        >
          <Kv label="Default hold" value={config.bidHoldDefault} />
          <Kv label="Allowed range" value={`${config.bidHoldMin}% – ${config.bidHoldMax}%`} />
          <Kv label="Settlement window" value={config.settlementWindow} />
          <HoldRange value={holdValue} min={config.bidHoldMin} max={config.bidHoldMax} />
        </FeeCard>

        <FeeCard
          icon="$"
          iconTone="green"
          title="B-Stock markup"
          onEdit={() =>
            openEdit({
              key: 'bstockMarkup',
              label: 'B-Stock markup',
              title: 'Edit B-Stock markup',
              fieldLabel: 'New markup (%)',
              current: config.bstockMarkup,
              note: config.bstockNote,
            })
          }
        >
          <Kv label="Markup on upstream price" value={config.bstockMarkup} />
          <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
            <div>
              <p className="text-[11px] text-slate-500">B-Stock price</p>
              <p className="mt-0.5 text-[13px] font-medium text-slate-800">{example.upstream}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-500">Buyer sees (BidBridge price)</p>
              <p className="mt-0.5 text-[13px] font-medium text-emerald-700">{example.buyer}</p>
            </div>
          </div>
          <p className="flex gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5 text-[12px] leading-5 text-amber-900">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
            {config.bstockNote}
          </p>
        </FeeCard>

        <FeeCard icon="T" iconTone="maroon" title="Tier bands" onEdit={() => navigate('/admin/tiers')}>
          <p className="text-[12.5px] text-slate-600">Product prices each buyer tier can access.</p>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="grid grid-cols-2 gap-0 border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <span>Tier</span>
              <span>Price access</span>
            </div>
            {config.tierBands.map((row) => (
              <div
                key={row.tier}
                className="grid grid-cols-2 border-b border-slate-100 px-4 py-2.5 text-[12.5px] text-slate-800 last:border-b-0"
              >
                <span>{row.tier}</span>
                <span>{row.access}</span>
              </div>
            ))}
          </div>
        </FeeCard>

        <FeeCard
          icon="F"
          iconTone="blue"
          title="Freight"
          onEdit={() =>
            openEdit({
              key: 'freight:Nigeria',
              label: 'Freight rate (Nigeria)',
              title: 'Edit freight rate',
              fieldLabel: 'New rate (Nigeria)',
              current: config.freight.find((f) => f.destination === 'Nigeria')?.rate ?? '$8 / lb',
            })
          }
        >
          <p className="text-[12.5px] text-slate-600">Freight pricing used for landed cost estimates.</p>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="grid grid-cols-2 gap-0 border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <span>Destination</span>
              <span>Rate</span>
            </div>
            {config.freight.map((row) => (
              <div
                key={row.destination}
                className="grid grid-cols-2 border-b border-slate-100 px-4 py-2.5 text-[12.5px] text-slate-800 last:border-b-0"
              >
                <span>{row.destination}</span>
                <span>{row.rate}</span>
              </div>
            ))}
          </div>
        </FeeCard>
      </div>

      <div className="mt-2">
        <p className="mb-3 text-[15px] font-semibold text-slate-900">Configuration audit log</p>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-2.5 bg-slate-50 p-3 xl:hidden">
            {audit.map((row) => (
              <div
                key={row.id}
                className="flex min-h-[72px] items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 text-[14px] font-semibold leading-snug text-slate-900">{row.configuration}</p>
                    <span className="shrink-0 text-[12px] font-medium text-slate-600">{row.action}</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-slate-500">
                    <span>{row.previous}</span>
                    <span className="mx-1.5 text-slate-300">→</span>
                    <span className="font-medium text-slate-700">{row.next}</span>
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-slate-400">
                    {row.admin} · {row.at}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden xl:block">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_1fr_1.3fr_0.7fr] gap-2 border-b border-slate-100 bg-slate-50 px-6 py-2.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <span>Configuration</span>
              <span>Previous</span>
              <span>New</span>
              <span>Admin</span>
              <span>Date/time</span>
              <span>Action</span>
            </div>
            {audit.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1.2fr_0.8fr_0.8fr_1fr_1.3fr_0.7fr] gap-2 border-b border-slate-100 px-6 py-3 text-[12.5px] text-slate-800 last:border-b-0"
              >
                <span>{row.configuration}</span>
                <span className="text-slate-600">{row.previous}</span>
                <span className="font-medium">{row.next}</span>
                <span>{row.admin}</span>
                <span className="text-slate-500">{row.at}</span>
                <span className="text-slate-600">{row.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {edit && step === 'edit' ? (
        <AdminModal
          title={edit.title}
          subtitle="Step 1 of 2 — Enter new value"
          maxWidth={512}
          onClose={tryClose}
          footer={
            <>
              <AdminButton variant="outline" onClick={tryClose}>
                Cancel
              </AdminButton>
              <AdminButton onClick={goPreview}>Preview impact</AdminButton>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[13px]">
              <span className="text-slate-600">
                {edit.key === 'bstockMarkup'
                  ? 'Current markup on upstream price'
                  : edit.key === 'bidHoldDefault'
                    ? 'Current default hold'
                    : `Current ${edit.label.toLowerCase()}`}
              </span>
              <span className="font-semibold text-slate-900">{edit.current}</span>
            </div>
            <div>
              <FieldInput label={edit.fieldLabel} value={draft} onChange={(v) => { setDraft(v); setError('') }} />
              {error ? (
                <p className="mt-2 flex items-start gap-1.5 text-[12px] text-red-600">
                  <span aria-hidden>⚠</span>
                  {error}
                </p>
              ) : (
                <p className="mt-2 text-[12px] text-slate-500">
                  {edit.min != null
                    ? `Allowed range ${edit.min}% – ${edit.max}%.`
                    : edit.key.startsWith('freight:')
                      ? 'Enter the rate including unit (e.g. $8 / lb).'
                      : 'Value must be a valid percentage.'}
                </p>
              )}
            </div>
            {error && edit.min != null ? (
              <p className="rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700">
                This value is outside the allowed range and cannot be saved.
              </p>
            ) : null}
            {edit.note ? (
              <p className="flex gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] leading-5 text-slate-600">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-400" />
                {edit.note}
              </p>
            ) : null}
          </div>
        </AdminModal>
      ) : null}

      {edit && step === 'preview' ? (
        <AdminModal
          title="Preview changes"
          subtitle="Step 2 of 2 — Confirm before saving"
          maxWidth={512}
          onClose={() => setStep('edit')}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setStep('edit')}>
                Back
              </AdminButton>
              <AdminButton onClick={save}>Confirm & save changes</AdminButton>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-stretch gap-3">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                <p className="text-[12px] text-slate-500">Current</p>
                <p className="mt-1 text-[24px] font-semibold text-slate-900">{edit.current}</p>
              </div>
              <div className="flex items-center text-slate-400">→</div>
              <div className="flex-1 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3.5">
                <p className="text-[12px] text-emerald-700">New</p>
                <p className="mt-1 text-[24px] font-semibold text-slate-900">{draftDisplay}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-[12px] font-medium text-slate-500">Impact</p>
              <p className="mt-1 text-[13px] leading-5 text-slate-700">
                {edit.key === 'bstockMarkup'
                  ? `New listings will use the updated ${draftDisplay} markup. Existing live auctions remain unchanged until sync refresh.`
                  : `New value ${draftDisplay} will apply going forward. Review the change before confirming.`}
              </p>
            </div>
          </div>
        </AdminModal>
      ) : null}

      {edit && step === 'discard' ? (
        <AdminModal
          title="Discard changes?"
          maxWidth={440}
          onClose={() => setStep('edit')}
          footerAlign="end"
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setStep('edit')}>
                Keep editing
              </AdminButton>
              <AdminButton variant="danger" onClick={closeAll}>
                Discard changes
              </AdminButton>
            </>
          }
        >
          <p className="text-center text-[13.5px] leading-5 text-slate-600">
            You have an unsaved edit to the {edit.label.toLowerCase()} configuration. If you leave now, this
            change will be lost.
          </p>
        </AdminModal>
      ) : null}
    </AdminListShell>
  )
}

/** Keep unused import type reference for clarity in store typing */
export type { AdminFeeConfig }
