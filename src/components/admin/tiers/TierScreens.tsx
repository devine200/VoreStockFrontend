import { useMemo, useState } from 'react'
import { AdminButton, AdminModal } from '@/components/admin/ui'
import { AdminListShell } from '@/components/admin/screens'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { overrideBuyerTier, updateTierValue } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminTier, AdminTierConfig } from '@/types/admin'
import { cn } from '@/utils/format'

function money(n: number) {
  return `$${n.toLocaleString('en-US')}`
}

function formatPriceInput(n: number) {
  return n.toLocaleString('en-US')
}

function parsePriceInput(raw: string) {
  const cleaned = raw.replace(/[^0-9]/g, '')
  if (!cleaned) return NaN
  return Number(cleaned)
}

function rangeLabel(tier: AdminTier, config: AdminTierConfig) {
  if (tier.number === 1) return `Under ${money(config.tier1Max)}`
  if (tier.number === 2) return `${money(config.tier1Max)} – ${money(config.tier2Max)}`
  return `Over ${money(config.tier2Max)}`
}

function ruleLabel(tier: AdminTier, config: AdminTierConfig) {
  if (tier.number === 1) return `Tier 1 — Products under ${money(config.tier1Max)}`
  if (tier.number === 2) return `Tier 2 — ${money(config.tier1Max)} – ${money(config.tier2Max)}`
  return `Tier 3 — Products over ${money(config.tier2Max)}`
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

const TIER_BADGE: Record<1 | 2 | 3, string> = {
  1: 'bg-[#dbeafe] text-[#1d4ed8]',
  2: 'bg-[#fef3c7] text-[#b45309]',
  3: 'bg-[#d1fae5] text-[#047857]',
}

const BAR_SEGMENT: Record<1 | 2 | 3, string> = {
  1: 'bg-[#60a5fa] text-white',
  2: 'bg-[#fbbf24] text-slate-900',
  3: 'bg-[#34d399] text-slate-900',
}

type ModalKind = 'edit' | 'preview' | 'override' | null

export function TiersConfiguration() {
  const dispatch = useAppDispatch()
  const tiers = useAppSelector((s) => s.admin.tiers)
  const config = useAppSelector((s) => s.admin.tierConfig)
  const audit = useAppSelector((s) => s.admin.tierAudit)
  const buyers = useAppSelector((s) => s.admin.buyers)

  const [modal, setModal] = useState<ModalKind>(null)
  const [editing, setEditing] = useState<AdminTier | null>(null)
  const [thresholdInput, setThresholdInput] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [bannerError, setBannerError] = useState('')

  const [overrideBuyerId, setOverrideBuyerId] = useState('')
  const [overrideTier, setOverrideTier] = useState('Tier 2')
  const [overrideReason, setOverrideReason] = useState('')

  const overrideBuyer = useMemo(
    () => buyers.find((b) => b.id === overrideBuyerId) ?? buyers.find((b) => b.name === 'Ada Okonkwo') ?? buyers[0],
    [buyers, overrideBuyerId],
  )

  const openEdit = (tier: AdminTier) => {
    setEditing(tier)
    const value = tier.number === 1 ? config.tier1Max : config.tier2Max
    setThresholdInput(formatPriceInput(value))
    setFieldError('')
    setBannerError('')
    setModal('edit')
  }

  const openOverride = () => {
    const ada = buyers.find((b) => b.name === 'Ada Okonkwo') ?? buyers[0]
    setOverrideBuyerId(ada?.id ?? '')
    const current = ada?.tier ?? 'Tier 1'
    setOverrideTier(current === 'Tier 1' ? 'Tier 2' : current === 'Tier 2' ? 'Tier 3' : 'Tier 2')
    setOverrideReason('')
    setModal('override')
  }

  const proposedValue = parsePriceInput(thresholdInput)
  const previousRule = editing ? ruleLabel(editing, config) : ''
  const proposedConfig: AdminTierConfig = editing
    ? {
        tier1Max: editing.number === 1 ? proposedValue : config.tier1Max,
        tier2Max: editing.number !== 1 ? proposedValue : config.tier2Max,
      }
    : config
  const newRule = editing && Number.isFinite(proposedValue) ? ruleLabel(editing, proposedConfig) : ''

  const validateEdit = () => {
    if (!editing || !Number.isFinite(proposedValue) || proposedValue <= 0) {
      setFieldError('Enter a valid price threshold.')
      setBannerError('')
      return false
    }
    if (editing.number === 1) {
      if (proposedValue >= config.tier2Max) {
        setFieldError(
          `Tier ranges cannot overlap. Tier 1 must remain below Tier 2's maximum (${money(config.tier2Max)}).`,
        )
        setBannerError('This threshold overlaps with Tier 2 and Tier 3 and cannot be saved.')
        return false
      }
    } else if (proposedValue <= config.tier1Max) {
      setFieldError(
        `Tier ranges cannot overlap. This threshold must stay above Tier 1's maximum (${money(config.tier1Max)}).`,
      )
      setBannerError('This threshold overlaps with Tier 1 and cannot be saved.')
      return false
    }
    setFieldError('')
    setBannerError('')
    return true
  }

  const saveThreshold = () => {
    if (!editing || !validateEdit()) return
    const boundary = editing.number === 1 ? 'tier1Max' : 'tier2Max'
    const previousLabel =
      editing.number === 1
        ? `Under ${money(config.tier1Max)}`
        : editing.number === 2
          ? `${money(config.tier1Max)}–${money(config.tier2Max)}`
          : `Over ${money(config.tier2Max)}`
    const nextLabel =
      editing.number === 1
        ? `Under ${money(proposedValue)}`
        : editing.number === 2
          ? `${money(config.tier1Max)}–${money(proposedValue)}`
          : `Over ${money(proposedValue)}`
    dispatch(
      updateTierValue({
        boundary,
        value: proposedValue,
        previousLabel,
        nextLabel,
        tierName: editing.name,
      }),
    )
    dispatch(showToast(`${editing.name} threshold updated`))
    setModal(null)
    setEditing(null)
  }

  const t1Flex = Math.max(12, Math.round((config.tier1Max / (config.tier2Max * 1.4)) * 100))
  const t2Flex = Math.max(16, Math.round(((config.tier2Max - config.tier1Max) / (config.tier2Max * 1.4)) * 100))
  const t3Flex = Math.max(16, 100 - t1Flex - t2Flex)

  const fieldHint =
    editing?.number === 1
      ? 'Products up to this value will be accessible to Tier 1 buyers.'
      : editing?.number === 2
        ? 'Products up to this value will be accessible to Tier 2 buyers.'
        : 'Products above this value will be accessible to Tier 3 buyers.'

  const fieldLabel =
    editing?.number === 3 ? 'New minimum price threshold ($)' : 'New maximum price threshold ($)'

  return (
    <AdminListShell
      title="Tiers Configuration"
      subtitle="Manage buyer tier access rules and product price thresholds."
      actions={
        <AdminButton variant="outline" onClick={openOverride}>
          Override buyer tier
        </AdminButton>
      }
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-[13.5px] font-semibold text-slate-800">Tier-to-price access</p>
        <div className="mt-3 flex h-10 w-full overflow-hidden rounded-lg">
          <div className={cn('flex items-center justify-center text-[12px] font-semibold', BAR_SEGMENT[1])} style={{ flex: t1Flex }}>
            Tier 1
          </div>
          <div className={cn('flex items-center justify-center text-[12px] font-semibold', BAR_SEGMENT[2])} style={{ flex: t2Flex }}>
            Tier 2
          </div>
          <div className={cn('flex items-center justify-center text-[12px] font-semibold', BAR_SEGMENT[3])} style={{ flex: t3Flex }}>
            Tier 3
          </div>
        </div>
        <div className="relative mt-2.5 h-4 text-[11px] text-slate-500">
          <span className="absolute left-0">$0</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${(t1Flex / (t1Flex + t2Flex + t3Flex)) * 100}%` }}>
            {money(config.tier1Max)}
          </span>
          <span
            className="absolute -translate-x-1/2"
            style={{ left: `${((t1Flex + t2Flex) / (t1Flex + t2Flex + t3Flex)) * 100}%` }}
          >
            {money(config.tier2Max)}
          </span>
          <span className="absolute right-0">Unlimited →</span>
        </div>
      </div>

      <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div key={tier.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-lg text-[15px] font-semibold',
                  TIER_BADGE[tier.number],
                )}
              >
                {tier.number}
              </span>
              <div>
                <p className="text-[15px] font-semibold text-slate-900">{tier.name}</p>
                <p className="text-[12.5px] text-slate-500">{rangeLabel(tier, config)}</p>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-slate-600">{tier.description}</p>
            <div className="my-3.5 h-px bg-slate-100" />
            <div className="space-y-2.5 text-[13px]">
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500">Product price range</span>
                <span className="text-right font-medium text-slate-800">{rangeLabel(tier, config)}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500">Current rule</span>
                <span className="max-w-[60%] text-right font-medium text-slate-800">{ruleLabel(tier, config)}</span>
              </div>
            </div>
            <AdminButton variant="outline" className="mt-4" onClick={() => openEdit(tier)}>
              Edit
            </AdminButton>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-3 text-[14px] font-semibold text-slate-800">Tier configuration & override audit log</p>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-7 gap-2 border-b border-slate-100 px-4 py-2.5 text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:grid">
            <span>Action</span>
            <span>Previous</span>
            <span>New</span>
            <span>Buyer</span>
            <span>Reason</span>
            <span>Admin</span>
            <span>Date/Time</span>
          </div>
          <div className="divide-y divide-slate-100">
            {audit.map((row) => (
              <div key={row.id} className="grid gap-1.5 px-4 py-3 text-[12.5px] text-slate-700 sm:grid-cols-7 sm:items-start sm:gap-2">
                <div className="flex justify-between gap-3 sm:block">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:hidden">Action</span>
                  <span className="font-medium text-slate-800">{row.action}</span>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:hidden">Previous</span>
                  <span>{row.previous}</span>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:hidden">New</span>
                  <span>{row.next}</span>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:hidden">Buyer</span>
                  <span>{row.buyer}</span>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:hidden">Reason</span>
                  <span className="text-slate-600">{row.reason}</span>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:hidden">Admin</span>
                  <span>{row.admin}</span>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:hidden">Date/Time</span>
                  <span className="text-slate-500">{row.at}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal === 'edit' && editing ? (
        <AdminModal
          title={`Edit ${editing.name} threshold`}
          subtitle="Step 1 of 2 — Update the product price access threshold"
          maxWidth={512}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                onClick={() => {
                  if (validateEdit()) setModal('preview')
                }}
              >
                Preview Change
              </AdminButton>
            </>
          }
        >
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5 text-[13px]">
            <span className="text-slate-500">Current rule</span>
            <span className="font-medium text-slate-800">{previousRule}</span>
          </div>
          <label className="mt-4 block text-[12px] font-medium text-slate-700">
            {fieldLabel}
            <input
              value={thresholdInput}
              onChange={(e) => {
                setThresholdInput(e.target.value)
                setFieldError('')
                setBannerError('')
              }}
              className={cn(
                'mt-1.5 h-10 w-full rounded-lg border px-3.5 text-[13.5px] outline-none',
                fieldError ? 'border-red-400' : 'border-slate-200',
              )}
            />
          </label>
          {fieldError ? (
            <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-4 text-red-600">
              <span aria-hidden>⚠</span>
              {fieldError}
            </p>
          ) : (
            <p className="mt-1.5 text-[12px] text-slate-400">{fieldHint}</p>
          )}
          {bannerError ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{bannerError}</p>
          ) : null}
        </AdminModal>
      ) : null}

      {modal === 'preview' && editing ? (
        <AdminModal
          title="Preview tier change"
          subtitle="Step 2 of 2 — Confirm before saving"
          maxWidth={512}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal('edit')}>
                Back
              </AdminButton>
              <AdminButton onClick={saveThreshold}>Confirm & save changes</AdminButton>
            </>
          }
        >
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 rounded-lg bg-slate-50 px-4 py-3.5">
              <p className="text-[11px] text-slate-500">Current rule</p>
              <p className="mt-1 text-[13px] font-medium leading-5 text-slate-800">{previousRule}</p>
            </div>
            <span className="shrink-0 text-slate-400" aria-hidden>
              →
            </span>
            <div className="min-w-0 flex-1 rounded-lg bg-slate-50 px-4 py-3.5">
              <p className="text-[11px] text-slate-500">New rule</p>
              <p className="mt-1 text-[13px] font-medium leading-5 text-emerald-700">{newRule}</p>
            </div>
          </div>
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] leading-5 text-amber-900">
            <span className="mr-1.5 inline-block size-1.5 rounded-full bg-amber-500 align-middle" aria-hidden />
            Changing this rule affects which products {editing.name} buyers can access immediately after saving.
          </p>
        </AdminModal>
      ) : null}

      {modal === 'override' && overrideBuyer ? (
        <AdminModal
          title="Override buyer tier"
          subtitle="Manually change this buyer's tier. This is an exceptional action."
          maxWidth={512}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                disabled={!overrideReason.trim() || overrideTier === overrideBuyer.tier}
                onClick={() => {
                  dispatch(
                    overrideBuyerTier({
                      id: overrideBuyer.id,
                      tier: overrideTier,
                      reason: overrideReason.trim(),
                    }),
                  )
                  dispatch(showToast('Buyer tier override recorded'))
                  setModal(null)
                }}
              >
                Confirm Override
              </AdminButton>
            </>
          }
        >
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3.5 py-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#f4f0f1] text-[12px] font-semibold text-[#480516]">
              {initials(overrideBuyer.name)}
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-slate-900">{overrideBuyer.name}</p>
              <p className="text-[12px] text-slate-500">Current tier: {overrideBuyer.tier}</p>
            </div>
          </div>
          <p className="mb-2 mt-4 text-[12px] font-medium text-slate-700">New tier</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {['Tier 1', 'Tier 2', 'Tier 3'].map((tierOption) => (
              <button
                key={tierOption}
                type="button"
                onClick={() => setOverrideTier(tierOption)}
                className={cn(
                  'min-h-10 rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors',
                  overrideTier === tierOption
                    ? 'border-[1.5px] border-[#a7878f] bg-[#f4f0f1] text-[#480516]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                )}
              >
                {tierOption}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-[12px] font-medium text-slate-700">
            Reason for override (required)
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Consistent high-value wins; manual upgrade approved."
              className="mt-1.5 min-h-[72px] w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-[13px] font-normal outline-none placeholder:text-slate-400"
            />
          </label>
          <p className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-[12px] leading-5 text-sky-800">
            <span className="mr-1.5 inline-block size-1.5 rounded-full bg-sky-500 align-middle" aria-hidden />
            This override will be recorded in the audit log with your name, the reason, and the date/time.
          </p>
        </AdminModal>
      ) : null}
    </AdminListShell>
  )
}
