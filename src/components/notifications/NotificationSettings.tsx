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
        checked ? 'bg-[#480516]' : 'bg-[#d1d5db]',
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
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
      <div className="px-4 py-4 sm:px-5">
        <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Notification Settings</h2>
      </div>
      <div className="divide-y divide-[#ebebec] border-t border-[#ebebec]">
        {ROWS.map((row) => (
          <div key={row.key} className="flex min-h-[53px] items-center justify-between gap-4 px-4 py-4 sm:px-5">
            <p className="text-[14px] text-[#1a1e26]">{row.label}</p>
            <Toggle
              label={row.label}
              checked={draft[row.key]}
              onChange={(next) => setDraft((prev) => ({ ...prev, [row.key]: next }))}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end border-t border-[#ebebec] px-4 py-4 sm:px-5">
        <Button type="button" className="h-[52px] w-full px-6 sm:w-auto" onClick={() => onSave(draft)}>
          Save preferences
        </Button>
      </div>
    </section>
  )
}
