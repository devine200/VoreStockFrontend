export function formatMoney(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: amount >= 1000 ? 0 : 2,
  }).format(amount)
}

export function formatPct(part: number, whole: number) {
  if (!whole) return '—'
  return `${Math.round((part / whole) * 100)}% of MSRP`
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function timeLeft(endsAt: string) {
  const ms = new Date(endsAt).getTime() - Date.now()
  if (ms <= 0) return { label: 'Ended', expired: true, hours: 0, minutes: 0, seconds: 0, days: 0 }
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const label =
    days > 0
      ? `${days}d ${hours}h`
      : hours > 0
        ? `${hours}h ${minutes}m`
        : `${minutes}m ${seconds}s`
  return { label, expired: false, hours, minutes, seconds, days }
}
