import { useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/sessionSlice'
import { toggleAccountMenu } from '@/store/slices/uiSlice'
import { cn, formatMoney } from '@/utils/format'

type MenuItem = {
  to: string
  label: string
  hint: string
  icon: ReactNode
  badge?: number
}

type MenuGroup = {
  group: string
  items: MenuItem[]
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#c8c9cb]">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBox({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f6] text-[#480516]">
      {children}
    </span>
  )
}

const Icons = {
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 4 7v5c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V7l-8-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  heart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.4-7-9.2C5 8 7 6 9.4 6c1.4 0 2.6.7 3.6 1.8C14 6.7 15.2 6 16.6 6 19 6 21 8 21 10.8 21 15.6 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  package: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3 3 8v8l9 5 9-5V8l-9-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 13V8M3 8l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  wallet: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18M16 14.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 18h7a7 7 0 1 0-7-7v7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12h.01M12 12h.01M15 12h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4 3 20h18L12 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  document: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-5-6Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 3v6h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  help: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1.5 1-1.5 2.2V15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 18h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  verified: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 4 7v5c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V7l-8-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sliders: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M8 14v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  referral: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 19c1.2-2.5 3.2-3.8 6-3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 8h5M18.5 5.5v5M15 15.5c1.2-.8 2.6-1.2 4-1.2 1.2 0 2.3.3 3.2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  signOut: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 12h10M11 9l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export function AccountMenu() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const user = useAppSelector((s) => s.session.user)
  const wallet = useAppSelector((s) => s.wallet.available)
  const activeBids = useAppSelector((s) =>
    s.bids.items.filter((b) => b.status === 'leading' || b.status === 'outbid' || b.status === 'active'),
  )
  const outbid = activeBids.filter((b) => b.status === 'outbid').length
  const watch = useAppSelector((s) => s.watchlist.ids.length)
  const pendingOffers = useAppSelector((s) => s.offers.items.filter((o) => o.status === 'pending')).length
  const openDisputes = useAppSelector(
    (s) => s.disputes.items.filter((d) => d.status !== 'resolved' && d.status !== 'closed').length,
  )
  const awaitingContracts = useAppSelector((s) =>
    s.contracts.items.filter((c) => c.status === 'awaiting_signature'),
  ).length
  const unread = useAppSelector((s) => s.notifications.items.filter((n) => !n.read).length)
  const inTransit = useAppSelector((s) => s.orders.items.filter((o) => o.status === 'in_transit')).length

  const groups: MenuGroup[] = [
    ...(user?.role === 'admin'
      ? [
          {
            group: 'Ops',
            items: [
              {
                to: '/admin',
                label: 'Admin dashboard',
                hint: 'Queues and console',
                icon: Icons.sliders,
              },
            ],
          },
        ]
      : []),
    {
      group: 'Bidding',
      items: [
        {
          to: '/bids',
          label: 'Bids & Auctions',
          hint: `${activeBids.length} active · ${outbid} outbid`,
          icon: Icons.shield,
          badge: activeBids.length || undefined,
        },
        {
          to: '/watchlist',
          label: 'Watchlist',
          hint: `${watch} saved`,
          icon: Icons.heart,
        },
      ],
    },
    {
      group: 'Transactions',
      items: [
        {
          to: '/orders',
          label: 'Orders & Tracking',
          hint: `${inTransit} in transit`,
          icon: Icons.package,
          badge: inTransit || undefined,
        },
        {
          to: '/wallet',
          label: 'Wallet',
          hint: `Balance: ${formatMoney(wallet)}`,
          icon: Icons.wallet,
        },
        {
          to: '/offers',
          label: 'Offers',
          hint: `${pendingOffers} pending`,
          icon: Icons.chat,
          badge: pendingOffers || undefined,
        },
        {
          to: '/disputes',
          label: 'Disputes',
          hint: `${openDisputes} open`,
          icon: Icons.warning,
          badge: openDisputes || undefined,
        },
        {
          to: '/contracts',
          label: 'Contracts',
          hint: `${awaitingContracts} awaiting signature`,
          icon: Icons.document,
          badge: awaitingContracts || undefined,
        },
      ],
    },
    {
      group: 'Help & Settings',
      items: [
        {
          to: '/support',
          label: 'Support',
          hint: 'Help center',
          icon: Icons.help,
        },
        {
          to: '/profile',
          label: 'Profile & Security',
          hint: 'Settings, password',
          icon: Icons.profile,
        },
      ],
    },
    {
      group: 'Account',
      items: [
        {
          to: '/notifications',
          label: 'Notifications',
          hint: `${unread} unread`,
          icon: Icons.bell,
          badge: unread || undefined,
        },
        {
          to: '/verification',
          label: 'Verification',
          hint: user?.kybStatus === 'pending' ? 'KYB pending' : 'Verified',
          icon: Icons.verified,
        },
        {
          to: '/preferences',
          label: 'Buying Preferences',
          hint: 'Personalise feed',
          icon: Icons.sliders,
        },
        {
          to: '/referrals',
          label: 'Referral',
          hint: 'Invites and freight credits',
          icon: Icons.referral,
        },
      ],
    },
  ]

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        dispatch(toggleAccountMenu(false))
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(toggleAccountMenu(false))
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [dispatch])

  const go = (to: string) => {
    dispatch(toggleAccountMenu(false))
    navigate(to)
  }

  if (!user) {
    return (
      <div
        ref={ref}
        className="absolute right-0 top-full z-50 mt-2 w-[min(318px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#f4f4f4] bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.1),0px_2px_8px_rgba(0,0,0,0.06)] animate-slide-up"
      >
        <div className="border-b border-[#ebebec] p-4">
          <p className="text-[15px] font-semibold text-[#1a1e26]">Welcome to VSK Global</p>
          <p className="mt-1 text-[13px] text-[#7a7b7c]">Sign in to bid, watch lots, and manage escrow.</p>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <button
            type="button"
            className="h-10 rounded-full bg-[#480516] px-4 text-[14px] font-medium text-white"
            onClick={() => go('/login')}
          >
            Sign in
          </button>
          <button
            type="button"
            className="h-10 rounded-xl border border-[#ebebec] px-4 text-[14px] font-medium text-[#1a1e26]"
            onClick={() => go('/signup')}
          >
            Create account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-2 w-[min(318px,calc(100vw-2rem))] max-h-[min(80vh,640px)] overflow-auto rounded-2xl border border-[#f4f4f4] bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.1),0px_2px_8px_rgba(0,0,0,0.06)] animate-slide-up"
    >
      <div className="flex items-center gap-3 border-b border-[#f4f4f4] px-5 py-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#480516] text-[14px] font-semibold text-white">
          {user.avatarInitials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold leading-5 text-[#1a1e26]">{user.name}</p>
          <p className="truncate text-[12px] leading-4 text-[#7a7b7c]">{user.email}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#e6f4ed] px-2 py-0.5 text-[10px] font-semibold leading-[15px] text-[#0a6e38]">
          Tier {user.tier}
        </span>
      </div>

      {groups.map((group) => (
        <div key={group.group} className="border-b border-[#f4f4f4] pt-1">
          <p className="px-5 pb-1 pt-3 text-[10px] font-semibold uppercase leading-[15px] tracking-[1px] text-[#9d9ea2]">
            {group.group}
          </p>
          {group.items.map((item) => (
            <button
              key={item.to}
              type="button"
              onClick={() => go(item.to)}
              className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-[#f9f5f6]"
            >
              <IconBox>{item.icon}</IconBox>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium leading-5 text-[#1a1e26]">{item.label}</p>
                <p className="truncate text-[12px] leading-4 text-[#9d9ea2]">{item.hint}</p>
              </div>
              {item.badge != null && item.badge > 0 ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-[#480516] text-[10px] font-bold leading-[15px] text-white">
                  {item.badge}
                </span>
              ) : null}
              <Chevron />
            </button>
          ))}
        </div>
      ))}

      <button
        type="button"
        className={cn(
          'flex w-full items-center gap-2 px-5 py-3 text-left text-[14px] font-normal text-[#7a7b7c]',
          'transition hover:bg-[#f9f5f6] hover:text-[#1a1e26]',
        )}
        onClick={() => {
          dispatch(logout())
          dispatch(toggleAccountMenu(false))
          navigate('/')
        }}
      >
        <span className="text-[#7a7b7c]">{Icons.signOut}</span>
        Sign out
      </button>
    </div>
  )
}
