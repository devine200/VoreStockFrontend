import { FormEvent, useLayoutEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/shared/Button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updatePrefs } from '@/store/slices/accountSlices'
import { updateProfile } from '@/store/slices/sessionSlice'
import { showSuccess, showToast } from '@/store/slices/uiSlice'
import { cn } from '@/utils/format'
import { Icon } from '@/components/shared/Icon'
import arrowDownSm from '@/assets/icons/arrow-down-sm.svg'
import deviceIcon from '@/assets/icons/device.svg'
import shieldCheckIcon from '@/assets/icons/shield-check.svg'

type TabId = 'profile' | 'security'

type SessionRow = {
  id: string
  device: string
  kind: 'desktop' | 'mobile'
  location: string
  when: string
  current?: boolean
}

const INITIAL_SESSIONS: SessionRow[] = [
  { id: 's1', device: 'Chrome on macOS', kind: 'desktop', location: 'Lagos, NG', when: 'Now', current: true },
  { id: 's2', device: 'Safari on iPhone', kind: 'mobile', location: 'Lagos, NG', when: '2 hours ago' },
  { id: 's3', device: 'Firefox on Windows', kind: 'desktop', location: 'Abuja, NG', when: '3 days ago' },
]

const fieldClass =
  'mt-1.5 h-[42px] w-full rounded-xl border border-[#ebebec] bg-white px-[15px] text-[14px] text-[#1a1e26] outline-none placeholder:text-[#9ca3af] focus:border-[#480516]'

function formatWalletMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

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
          'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition',
          checked && 'translate-x-4',
        )}
      />
    </button>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
      <div className="border-b border-[#ebebec] px-5 py-5 sm:px-6">
        <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">{title}</h2>
        <p className="mt-0.5 text-[13px] leading-4 text-[#7a7b7c]">{subtitle}</p>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  )
}

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const user = useAppSelector((s) => s.session.user)!
  const wallet = useAppSelector((s) => s.wallet.available)
  const bids = useAppSelector((s) => s.bids.items)
  const prefs = useAppSelector((s) => s.profile)
  const [tab, setTab] = useState<TabId>('profile')

  useLayoutEffect(() => {
    if (location.hash !== '#address') return
    setTab('profile')
    requestAnimationFrame(() => {
      document.getElementById('address')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.hash])

  const [name, setName] = useState(user.name)
  const [company, setCompany] = useState(user.company ?? '')
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [street, setStreet] = useState(prefs.street ?? '14 Broad Street, Lagos Island')
  const [city, setCity] = useState(prefs.city ?? 'Lagos')
  const [country, setCountry] = useState(prefs.country ?? 'Nigeria')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [dangerOpen, setDangerOpen] = useState(false)
  const [sessions, setSessions] = useState(INITIAL_SESSIONS)

  const activeBids = useMemo(
    () => bids.filter((b) => b.status === 'leading' || b.status === 'outbid' || b.status === 'active'),
    [bids],
  )
  const winning = activeBids.filter((b) => b.status === 'leading').length
  const outbid = activeBids.filter((b) => b.status === 'outbid').length
  const completedPurchases = bids.filter((b) => b.status === 'won').length || 1
  const tierProgress = Math.min(95, Math.round(((user.tier + completedPurchases) / 4) * 100))

  const twoFactor = prefs.twoFactor ?? true
  const loginAlerts = prefs.loginAlerts ?? true
  const outbidAlerts = prefs.outbidAlerts ?? false

  const saveProfile = (e: FormEvent) => {
    e.preventDefault()
    dispatch(updateProfile({ name, company, email, phone }))
    dispatch(updatePrefs({ street, city, country }))
    dispatch(
      showSuccess({
        title: 'Preference Saved',
        body: 'Your preference has been saved.',
        actionLabel: 'Done',
      }),
    )
  }

  const updatePassword = (e: FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      dispatch(showToast('Fill in all password fields'))
      return
    }
    if (newPassword.length < 8) {
      dispatch(showToast('New password must be at least 8 characters'))
      return
    }
    if (newPassword !== confirmPassword) {
      dispatch(showToast('New passwords do not match'))
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    dispatch(
      showSuccess({
        title: 'Preference Saved',
        body: 'Your preference has been saved.',
        actionLabel: 'Done',
      }),
    )
  }

  const metrics = [
    {
      label: 'Wallet balance',
      value: formatWalletMoney(wallet),
      foot: 'Available to bid',
      valueClass: 'text-[#0a6e38]',
    },
    {
      label: 'Active bids',
      value: String(activeBids.length),
      foot: (
        <>
          <span className="text-[#0a6e38]">{winning} winning</span>
          <span> · {outbid} outbid</span>
        </>
      ),
      valueClass: 'text-[#1a1e26]',
    },
    {
      label: 'Completed purchases',
      value: String(completedPurchases),
      foot: 'Lifetime won lots',
      valueClass: 'text-[#1a1e26]',
    },
  ]

  return (
    <div className="animate-fade-in min-w-0 space-y-6">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">
          Profile & Security
        </h1>
        <p className="pt-1 text-[14px] leading-5 text-[#7a7b7c]">
          Manage your personal information and account security
        </p>
      </div>

      <div className="inline-flex h-[46px] items-center rounded-full bg-[#f3f4f6] p-[5px]">
        {(
          [
            { id: 'profile' as const, label: 'Profile' },
            { id: 'security' as const, label: 'Security' },
          ]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'h-9 rounded-full px-5 text-[14px] font-medium transition',
              tab === t.id ? 'bg-white text-[#1a1e26] shadow-sm' : 'text-[#7a7b7c] hover:text-[#1a1e26]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        <form onSubmit={saveProfile} className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {metrics.map((card) => (
              <div
                key={card.label}
                className="min-w-0 rounded-2xl border border-[#ebebec] bg-white px-5 py-5 sm:px-6 sm:py-6"
              >
                <p className="text-[11px] font-medium uppercase tracking-[1.1px] text-[#9d9ea2]">{card.label}</p>
                <p
                  className={cn(
                    'mt-2 truncate text-[22px] font-semibold tabular-nums leading-[30px] tracking-[-1px] sm:text-[30px]',
                    card.valueClass,
                  )}
                >
                  {card.value}
                </p>
                <p className="mt-2 text-[13px] leading-4 text-[#7a7b7c]">{card.foot}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[13px] leading-[17px] text-[#480516]">
              BUYER STATUS <span className="font-semibold">Tier {user.tier} Buyer</span>
            </p>
            <p className="mt-3 text-[14px] font-semibold leading-[17px] text-[#1a1e26]">Progress to Tier 3</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ebebec]">
              <div className="h-full rounded-full bg-[#480516]" style={{ width: `${tierProgress}%` }} />
            </div>
            <p className="mt-2 text-right text-[12px] leading-[15px] text-[#9ca3af]">
              1 more completed purchase to unlock Tier 3
            </p>
          </div>

          <SectionCard
            title="Personal information"
            subtitle="This information is used for your account and verification."
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#480516] text-[18px] font-semibold text-white">
                  {user.avatarInitials}
                </span>
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold leading-5 text-[#1a1e26]">{name || user.name}</p>
                  <p className="mt-1 text-[13px] leading-4 text-[#7a7b7c]">{email}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[#e8f6ee] px-2.5 py-0.5 text-[12px] font-medium text-[#0a6e38]">
                      KYC Verified
                    </span>
                    <span className="rounded-full bg-[#fff6e5] px-2.5 py-0.5 text-[12px] font-medium text-[#b45309]">
                      KYB Pending
                    </span>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="h-[34px] w-fit px-[17px] text-[13px]"
                onClick={() => dispatch(showToast('Photo upload coming soon'))}
              >
                Change photo
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-[13px] font-medium text-[#4b5563]">
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
              </label>
              <label className="block text-[13px] font-medium text-[#4b5563]">
                Company
                <input value={company} onChange={(e) => setCompany(e.target.value)} className={fieldClass} />
              </label>
              <label className="block text-[13px] font-medium text-[#4b5563]">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="block text-[13px] font-medium text-[#4b5563]">
                Phone
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} />
              </label>
            </div>
          </SectionCard>

          <div id="address" className="scroll-mt-28">
            <SectionCard title="Address" subtitle="Used for shipping and delivery of won lots.">
              <label className="block text-[13px] font-medium text-[#4b5563]">
                Street address
                <input value={street} onChange={(e) => setStreet(e.target.value)} className={fieldClass} />
              </label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-[13px] font-medium text-[#4b5563]">
                  City
                  <input value={city} onChange={(e) => setCity(e.target.value)} className={fieldClass} />
                </label>
                <label className="block text-[13px] font-medium text-[#4b5563]">
                  Country
                  <input value={country} onChange={(e) => setCountry(e.target.value)} className={fieldClass} />
                </label>
              </div>
            </SectionCard>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="h-10 w-full px-8 text-[14px] font-semibold !bg-[#480516] sm:w-auto">
              Save profile
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <SectionCard title="Verification status" subtitle="Your current identity and contact verification.">
            <div className="divide-y divide-[#ebebec]">
              {(
                [
                  { label: 'Email address', ok: true },
                  { label: 'Phone number', ok: true },
                  { label: 'Identity (KYC)', ok: user.kycStatus === 'verified' },
                  { label: 'Business (KYB)', ok: user.kybStatus === 'verified' },
                ] as const
              ).map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    {row.ok ? (
                      <Icon src={shieldCheckIcon} size={14} />
                    ) : (
                      <span className="size-3.5 rounded-full border border-[#d1d5db]" />
                    )}
                    <span className="text-[14px] leading-5 text-[#1a1e26]">{row.label}</span>
                  </div>
                  {row.ok ? (
                    <span className="rounded-full bg-[#e8f6ee] px-2.5 py-0.5 text-[12px] font-medium text-[#0a6e38]">
                      Verified
                    </span>
                  ) : (
                    <Link to="/verification" className="text-[13px] font-medium text-[#480516] hover:underline">
                      Verify now →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Change password"
            subtitle="Use a strong, unique password you don't use elsewhere."
          >
            <form onSubmit={updatePassword} className="space-y-4">
              <label className="block text-[13px] font-medium text-[#4b5563]">
                Current password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className={fieldClass}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[13px] font-medium text-[#4b5563]">
                  New password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className={fieldClass}
                  />
                </label>
                <label className="block text-[13px] font-medium text-[#4b5563]">
                  Confirm password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className={fieldClass}
                  />
                </label>
              </div>
              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => dispatch(showToast('Password reset link sent to your email'))}
                  className="text-left text-[13px] font-medium text-[#480516] hover:underline"
                >
                  Forgot password?
                </button>
                <Button type="submit" className="h-10 w-full px-6 text-[14px] font-semibold !bg-[#480516] sm:w-auto">
                  Update password
                </Button>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Security settings" subtitle="Control how your account is protected.">
            <div className="divide-y divide-[#ebebec]">
              {(
                [
                  {
                    key: 'twoFactor' as const,
                    title: 'Two-factor authentication',
                    desc: 'Require a code when signing in from a new device',
                    value: twoFactor,
                  },
                  {
                    key: 'loginAlerts' as const,
                    title: 'Login alerts',
                    desc: 'Email me when a new device signs into my account',
                    value: loginAlerts,
                  },
                  {
                    key: 'outbidAlerts' as const,
                    title: 'Outbid alerts',
                    desc: "Notify me by SMS when I'm outbid on an active lot",
                    value: outbidAlerts,
                  },
                ]
              ).map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium leading-5 text-[#1a1e26]">{row.title}</p>
                    <p className="mt-0.5 text-[13px] leading-4 text-[#9ca3af]">{row.desc}</p>
                  </div>
                  <Toggle
                    label={row.title}
                    checked={row.value}
                    onChange={(next) => {
                      dispatch(updatePrefs({ [row.key]: next }))
                      dispatch(showToast(`${row.title} ${next ? 'enabled' : 'disabled'}`))
                    }}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Active sessions" subtitle="Devices currently signed into your account.">
            <div className="divide-y divide-[#ebebec]">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f8f8f9] text-[#4b5563]">
                    <Icon src={deviceIcon} size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium leading-4 text-[#1a1e26]">
                      {session.device}
                      {session.current ? (
                        <span className="rounded-full bg-[#e8f6ee] px-1.5 py-0.5 text-[11px] font-medium text-[#0a6e38]">
                          Current
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-[17px] text-[#9ca3af]">
                      {session.location} · {session.when}
                    </p>
                  </div>
                  {session.current ? null : (
                    <button
                      type="button"
                      onClick={() => {
                        setSessions((prev) => prev.filter((s) => s.id !== session.id))
                        dispatch(showToast(`Signed out ${session.device}`))
                      }}
                      className="shrink-0 text-[13px] font-medium text-[#ff383c] hover:underline"
                    >
                      Sign out
                    </button>
                  )}
                </div>
              ))}
            </div>
            {sessions.some((s) => !s.current) ? (
              <button
                type="button"
                onClick={() => {
                  setSessions((prev) => prev.filter((s) => s.current))
                  dispatch(showToast('Signed out of all other devices'))
                }}
                className="mt-4 text-[13px] font-medium text-[#ff383c] hover:underline"
              >
                Sign out of all other devices
              </button>
            ) : null}
          </SectionCard>

          <section className="overflow-hidden rounded-2xl border border-[#f5c2c0] bg-[#fdebec]">
            <button
              type="button"
              onClick={() => setDangerOpen((o) => !o)}
              className="flex h-[52px] w-full items-center justify-between gap-3 px-5 text-left sm:px-6"
            >
              <span className="flex items-center gap-2 text-[14px] font-semibold text-[#c62828]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M8 5.2v3.2M8 11.2h.007M7.04 2.8 1.6 12.4a1.07 1.07 0 0 0 .93 1.6h10.94a1.07 1.07 0 0 0 .93-1.6L8.96 2.8a1.07 1.07 0 0 0-1.92 0Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Danger zone
              </span>
              <Icon src={arrowDownSm} size={14} className={cn('transition', dangerOpen && 'rotate-180')} />
            </button>
            {dangerOpen ? (
              <div className="border-t border-[#f5c2c0] px-5 py-4 sm:px-6">
                <p className="text-[13px] leading-5 text-[#7a7b7c]">
                  Deactivating your account will pause bidding and hide your profile. This demo action does not
                  permanently delete data.
                </p>
                <Button
                  type="button"
                  variant="danger"
                  className="mt-4 h-10"
                  onClick={() => dispatch(showToast('Account deactivation is disabled in this demo'))}
                >
                  Deactivate account
                </Button>
              </div>
            ) : null}
          </section>
        </div>
      )}
    </div>
  )
}
