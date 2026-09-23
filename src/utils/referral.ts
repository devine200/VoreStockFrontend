/** Codes from a referral link: letters, numbers, and hyphens. */
const CODE_PATTERN = /^[A-Z0-9-]{3,32}$/

export function normalizeReferralCode(raw: string | null | undefined): string {
  if (!raw) return ''
  let decoded = raw
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    decoded = raw
  }
  const code = decoded.trim().toUpperCase()
  return CODE_PATTERN.test(code) ? code : ''
}

/** Signup URL that prefills and locks the referral code field. */
export function referralSignupPath(code: string) {
  return `/signup?ref=${encodeURIComponent(code)}`
}

export function referralAbsoluteLink(code: string) {
  const path = referralSignupPath(code)
  if (typeof window === 'undefined') return path
  return `${window.location.origin}${path}`
}
