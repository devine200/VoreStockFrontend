import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/shared/Icon'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/sessionSlice'
import { toggleAccountMenu } from '@/store/slices/uiSlice'
import { cn, formatMoney } from '@/utils/format'
import menuBids from '@/assets/icons/menu-bids.svg'
import menuHeart from '@/assets/icons/heart.svg'
import menuOrders from '@/assets/icons/menu-orders.svg'
import menuWallet from '@/assets/icons/menu-wallet.svg'
import menuOffers from '@/assets/icons/menu-offers.svg'
import menuDisputes from '@/assets/icons/menu-disputes.svg'
import menuContracts from '@/assets/icons/menu-contracts.svg'
import menuSupport from '@/assets/icons/menu-support.svg'
import menuProfile from '@/assets/icons/menu-profile.svg'
import menuBell from '@/assets/icons/menu-bell.svg'
import menuVerified from '@/assets/icons/menu-verified.svg'
import menuSliders from '@/assets/icons/menu-sliders.svg'
import menuSignOut from '@/assets/icons/menu-signout.svg'
import menuChevron from '@/assets/icons/menu-chevron.svg'

type MenuItem = {
  to: string
  label: string
  hint: string
  icon: string
  badge?: number
}

type MenuGroup = {
  group: string
  items: MenuItem[]
}

function Chevron() {
  return <Icon src={menuChevron} size={12} className="shrink-0 opacity-70" />
}

function IconBox({ src }: { src: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f5f5f6]">
      <Icon src={src} size={15} />
    </span>
  )
}

const Icons = {
  shield: menuBids,
  heart: menuHeart,
  package: menuOrders,
  wallet: menuWallet,
  chat: menuOffers,
  warning: menuDisputes,
  document: menuContracts,
  help: menuSupport,
  profile: menuProfile,
  bell: menuBell,
  verified: menuVerified,
  sliders: menuSliders,
  referral: menuProfile,
  signOut: menuSignOut,
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
              <IconBox src={item.icon} />
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
        <Icon src={Icons.signOut} size={14} className="opacity-70" />
        Sign out
      </button>
    </div>
  )
}
