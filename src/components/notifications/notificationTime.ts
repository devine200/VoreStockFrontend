export type NotificationGroup = 'today' | 'yesterday' | 'earlier'

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function notificationGroup(iso: string): NotificationGroup {
  const date = startOfDay(new Date(iso))
  const today = startOfDay(new Date())
  const yesterday = new Date(today.getTime() - 86400000)
  if (date.getTime() === today.getTime()) return 'today'
  if (date.getTime() === yesterday.getTime()) return 'yesterday'
  return 'earlier'
}

export function notificationTime(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const group = notificationGroup(iso)
  if (group === 'today') {
    const minutes = Math.max(1, Math.floor((now.getTime() - date.getTime()) / 60_000))
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    return `${hours} h ago`
  }
  if (group === 'yesterday') return 'Yesterday'
  const days = Math.max(1, Math.floor((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86400000))
  return days === 1 ? '1 day ago' : `${days} days ago`
}
