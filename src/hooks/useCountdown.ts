import { useEffect, useState } from 'react'
import { timeLeft } from '@/utils/format'

export function useCountdown(endsAt: string) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  void now
  return timeLeft(endsAt)
}
