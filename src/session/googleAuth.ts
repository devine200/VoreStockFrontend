export type GoogleAccount = {
  email: string
  name: string
}

export const GOOGLE_ACCOUNTS: GoogleAccount[] = [
  { name: 'Chukwuemeka Adeyemi', email: 'chukwuemeka.adeyemi@gmail.com' },
  { name: 'Demo Buyer', email: 'demo.buyer@gmail.com' },
]

export function googleAccountsFor(suggested?: Partial<GoogleAccount>): GoogleAccount[] {
  const extra =
    suggested?.email && suggested.email.includes('@')
      ? [
          {
            name: suggested.name?.trim() || suggested.email.split('@')[0],
            email: suggested.email.trim(),
          },
        ]
      : []
  const seen = new Set<string>()
  return [...extra, ...GOOGLE_ACCOUNTS].filter((account) => {
    const key = account.email.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
