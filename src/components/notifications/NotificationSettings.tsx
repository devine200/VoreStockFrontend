import { useEffect, useState } from 'react'
import { Button } from '@/components/shared/Button'
import { cn } from '@/utils/format'
import type { NotificationPrefs } from '@/types'

const ROWS: { key: keyof NotificationPrefs; label: string }[] = [
  { key: 'outbidAlerts', label: 'Outbid alerts' },
  { key: 'auctionEndingSoon', label: 'Auction ending soon' },
  { key: 'paymentDue', label: 'Payment due' },
  { key: 'shipmentUpdates', label: 'Shipment updates' },
  { key: 'walletActivity', label: 'Wallet activity' },
]

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full transition',
        checked ? 'bg-wine-500' : 'bg-[#d1d5db]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition',
          checked && 'translate-x-4',
        )}
      />
    </button>
  )
}

export function NotificationSettings({
  prefs,
  onSave,
}: {
  prefs: NotificationPrefs
  onSave: (next: NotificationPrefs) => void
}) {
  const [draft, setDraft] = useState(prefs)

  useEffect(() => {
    setDraft(prefs)
  }, [prefs])

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="px-5 py-4">
        <h2 className="text-[16px] font-semibold text-[#1a1e26]">Notification Settings</h2>
      </div>
      <div className="divide-y divide-border border-t border-border">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-4 px-5 py-4">
            <p className="text-[14px] text-[#1a1e26]">{row.label}</p>
            <Toggle
              label={row.label}
              checked={draft[row.key]}
              onChange={(next) => setDraft((prev) => ({ ...prev, [row.key]: next }))}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end border-t border-border px-5 py-4">
        <Button type="button" className="h-[52px] px-6" onClick={() => onSave(draft)}>
          Save preferences
        </Button>
      </div>
    </section>
  )
}
