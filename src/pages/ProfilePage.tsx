import { FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/shared/Button'
import { PageHeader } from '@/components/shared/PageChrome'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updatePrefs } from '@/store/slices/accountSlices'
import { updateProfile } from '@/store/slices/sessionSlice'
import { showSuccess, showToast } from '@/store/slices/uiSlice'
import { cn } from '@/utils/format'

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
        'relative h-6 w-11 shrink-0 rounded-full transition',
        checked ? 'bg-[#480516]' : 'bg-[#d1d5db]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition',
          checked && 'translate-x-5',
        )}
      />
    </button>
  )
}

function DeviceIcon({ kind }: { kind: 'desktop' | 'mobile' }) {
  if (kind === 'mobile') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 18h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.session.user)!
  const wallet = useAppSelector((s) => s.wallet.available)
  const bids = useAppSelector((s) => s.bids.items)
  const prefs = useAppSelector((s) => s.profile)
  const [tab, setTab] = useState<TabId>('profile')

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

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Profile & Security"
        subtitle="Manage your personal information and account security"
      />

      <div className="inline-flex rounded-full bg-[#f3f4f6] p-1">
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
              'h-9 rounded-full px-5 text-[13px] font-medium transition',
              tab === t.id ? 'bg-white text-[#1a1e26] shadow-sm' : 'text-[#7a7b7c] hover:text-[#1a1e26]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        <form onSubmit={saveProfile} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#ebebec] bg-white px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#9ca3af]">Wallet balance</p>
              <p className="mt-2 text-[26px] font-semibold tabular-nums text-[#1f7a45]">
                {formatWalletMoney(wallet)}
              </p>
              <p className="mt-1 text-[12px] text-[#9ca3af]">Available to bid</p>
            </div>
            <div className="rounded-xl border border-[#ebebec] bg-white px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#9ca3af]">Active bids</p>
              <p className="mt-2 text-[26px] font-semibold tabular-nums text-[#1a1e26]">{activeBids.length}</p>
              <p className="mt-1 text-[12px] text-[#9ca3af]">
                <span className="text-[#1f7a45]">{winning} winning</span> · {outbid} outbid
              </p>
            </div>
            <div className="rounded-xl border border-[#ebebec] bg-white px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#9ca3af]">Completed purchases</p>
              <p className="mt-2 text-[26px] font-semibold tabular-nums text-[#1a1e26]">{completedPurchases}</p>
              <p className="mt-1 text-[12px] text-[#9ca3af]">Lifetime won lots</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#ebebec] bg-white px-5 py-5">
            <p className="text-[13px] text-[#480516]">
              BUYER STATUS <span className="font-semibold">Tier {user.tier} Buyer</span>
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-[14px] font-semibold text-[#1a1e26]">Progress To Tier 3</p>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#ebebec]">
              <div className="h-full rounded-full bg-[#480516]" style={{ width: `${tierProgress}%` }} />
            </div>
            <p className="mt-2 text-right text-[12px] text-[#9ca3af]">
              1 more completed purchase to unlock Tier 3
            </p>
          </div>

          <section className="rounded-xl border border-[#ebebec] bg-white p-5 sm:p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1e26]">Personal information</h2>
            <p className="mt-1 text-[13px] text-[#9ca3af]">
              This information is used for your account and verification.
            </p>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#480516] text-[16px] font-semibold text-white">
                  {user.avatarInitials}
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-[#1a1e26]">{name || user.name}</p>
                  <p className="text-[13px] text-[#7a7b7c]">{email}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[#e8f6ee] px-2 py-0.5 text-[11px] font-medium text-[#1f7a45]">
                      KYC Verified
                    </span>
                    <span className="rounded-full bg-[#fff6e5] px-2 py-0.5 text-[11px] font-medium text-[#b45309]">
                      KYB Pending
                    </span>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => dispatch(showToast('Photo upload coming soon'))}
              >
                Change photo
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-[12px] font-medium text-[#4b5563]">
                Full name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516]"
                />
              </label>
              <label className="block text-[12px] font-medium text-[#4b5563]">
                Company
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516]"
                />
              </label>
              <label className="block text-[12px] font-medium text-[#4b5563]">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516]"
                />
              </label>
              <label className="block text-[12px] font-medium text-[#4b5563]">
                Phone
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516]"
                />
              </label>
            </div>

            <div className="mt-8 border-t border-[#ebebec] pt-6">
              <h3 className="text-[16px] font-semibold text-[#1a1e26]">Address</h3>
              <p className="mt-1 text-[13px] text-[#9ca3af]">Used for shipping and delivery of won lots.</p>
              <label className="mt-4 block text-[12px] font-medium text-[#4b5563]">
                Street address
                <input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516]"
                />
              </label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-[12px] font-medium text-[#4b5563]">
                  City
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516]"
                  />
                </label>
                <label className="block text-[12px] font-medium text-[#4b5563]">
                  Country
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516]"
                  />
                </label>
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <Button type="submit">Save profile</Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <section className="rounded-xl border border-[#ebebec] bg-white p-5 sm:p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1e26]">Verification status</h2>
            <p className="mt-1 text-[13px] text-[#9ca3af]">Your current identity and contact verification.</p>
            <div className="mt-4 divide-y divide-[#ebebec]">
              {(
                [
                  { label: 'Email address', ok: true },
                  { label: 'Phone number', ok: true },
                  { label: 'Identity (KYC)', ok: user.kycStatus === 'verified' },
                  { label: 'Business (KYB)', ok: user.kybStatus === 'verified' },
                ] as const
              ).map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 py-3.5">
                  <div className="flex items-center gap-2.5">
                    {row.ok ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f6ee] text-[11px] text-[#1f7a45]">
                        ✓
                      </span>
                    ) : (
                      <span className="h-5 w-5 rounded-full border border-[#d1d5db]" />
                    )}
                    <span className="text-[14px] text-[#1a1e26]">{row.label}</span>
                  </div>
                  {row.ok ? (
                    <span className="rounded-full bg-[#e8f6ee] px-2.5 py-0.5 text-[12px] font-medium text-[#1f7a45]">
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
          </section>

          <section className="rounded-xl border border-[#ebebec] bg-white p-5 sm:p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1e26]">Change password</h2>
            <p className="mt-1 text-[13px] text-[#9ca3af]">
              Use a strong, unique password you don&apos;t use elsewhere.
            </p>
            <form onSubmit={updatePassword} className="mt-5 space-y-4">
              <label className="block text-[12px] font-medium text-[#4b5563]">
                Current password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] outline-none placeholder:text-[#9ca3af] focus:border-[#480516]"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[12px] font-medium text-[#4b5563]">
                  New password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] outline-none placeholder:text-[#9ca3af] focus:border-[#480516]"
                  />
                </label>
                <label className="block text-[12px] font-medium text-[#4b5563]">
                  Confirm password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] outline-none placeholder:text-[#9ca3af] focus:border-[#480516]"
                  />
                </label>
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => dispatch(showToast('Password reset link sent to your email'))}
                  className="text-[13px] font-medium text-[#480516] hover:underline"
                >
                  Forgot password?
                </button>
                <Button type="submit">Update password</Button>
              </div>
            </form>
          </section>

          <section className="rounded-xl border border-[#ebebec] bg-white p-5 sm:p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1e26]">Security settings</h2>
            <p className="mt-1 text-[13px] text-[#9ca3af]">Control how your account is protected.</p>
            <div className="mt-4 divide-y divide-[#ebebec]">
              {(
                [
                  {
                    key: 'twoFactor' as const,
                    title: 'Two-factor authentication',
                    desc: 'Require a code from your authenticator app when signing in.',
                    value: twoFactor,
                  },
                  {
                    key: 'loginAlerts' as const,
                    title: 'Login alerts',
                    desc: 'Email me when a new device signs into my account.',
                    value: loginAlerts,
                  },
                  {
                    key: 'outbidAlerts' as const,
                    title: 'Outbid alerts',
                    desc: 'Notify me when someone outbids me on a watched or active lot.',
                    value: outbidAlerts,
                  },
                ]
              ).map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-[#1a1e26]">{row.title}</p>
                    <p className="mt-0.5 text-[13px] text-[#9ca3af]">{row.desc}</p>
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
          </section>

          <section className="rounded-xl border border-[#ebebec] bg-white p-5 sm:p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1e26]">Active sessions</h2>
            <p className="mt-1 text-[13px] text-[#9ca3af]">Devices currently signed into your account.</p>
            <div className="mt-4 divide-y divide-[#ebebec]">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3 py-3.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f5f6] text-[#4b5563]">
                    <DeviceIcon kind={session.kind} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[#1a1e26]">{session.device}</p>
                    <p className="text-[12px] text-[#9ca3af]">
                      {session.location} · {session.when}
                    </p>
                  </div>
                  {session.current ? (
                    <span className="rounded-full bg-[#e8f6ee] px-2.5 py-0.5 text-[12px] font-medium text-[#1f7a45]">
                      Current
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSessions((prev) => prev.filter((s) => s.id !== session.id))
                        dispatch(showToast(`Signed out ${session.device}`))
                      }}
                      className="text-[13px] font-medium text-[#ff383c] hover:underline"
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
          </section>

          <section className="overflow-hidden rounded-xl border border-[#f5c2c0] bg-[#fdebec]">
            <button
              type="button"
              onClick={() => setDangerOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="flex items-center gap-2 text-[14px] font-semibold text-[#c62828]">
                <span aria-hidden>⚠</span> Danger zone
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className={cn('text-[#c62828] transition', dangerOpen && 'rotate-180')}
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            {dangerOpen ? (
              <div className="border-t border-[#f5c2c0] px-5 py-4">
                <p className="text-[13px] text-[#7a7b7c]">
                  Deactivating your account will pause bidding and hide your profile. This demo action does not
                  permanently delete data.
                </p>
                <Button
                  type="button"
                  variant="danger"
                  className="mt-4"
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
