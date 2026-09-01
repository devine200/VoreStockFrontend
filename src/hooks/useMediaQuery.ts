import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** How many carousel slides to show at the current viewport. */
export function useCarouselVisible(desktop: number) {
  const isXl = useMediaQuery('(min-width: 1280px)')
  const isLg = useMediaQuery('(min-width: 1024px)')
  const isSm = useMediaQuery('(min-width: 640px)')
  if (isXl) return desktop
  if (isLg) return Math.min(desktop, 3)
  if (isSm) return Math.min(desktop, 2)
  return 1
}
