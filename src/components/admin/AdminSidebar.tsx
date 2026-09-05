import { NavLink } from 'react-router-dom'
import { adminIcons, adminLogo } from '@/assets/admin'
import { icons } from '@/assets'
import { Icon } from '@/components/shared/Icon'
import { cn } from '@/utils/format'

function OverviewGlyph({ active }: { active: boolean }) {
  const cell = active
    ? 'border-maroon-50 bg-maroon-600'
    : 'border-maroon-200'
  return (
    <span className="relative size-4 shrink-0">
      <span className={cn('absolute left-px top-px size-[6px] rounded-[1.5px] border-[1.3px]', cell)} />
      <span className={cn('absolute left-[9px] top-px size-[6px] rounded-[1.5px] border-[1.3px]', active ? 'border-maroon-50' : 'border-maroon-200')} />
      <span className={cn('absolute left-px top-[9px] size-[6px] rounded-[1.5px] border-[1.3px]', active ? 'border-maroon-50' : 'border-maroon-200')} />
      <span className={cn('absolute left-[9px] top-[9px] size-[6px] rounded-[1.5px] border-[1.3px]', active ? 'border-maroon-50' : 'border-maroon-200')} />
    </span>
  )
}

function ChartGlyph({ active }: { active: boolean }) {
  const bar = active ? 'border-maroon-50' : 'border-maroon-200'
  return (
    <span className="relative size-4 shrink-0">
      <span className={cn('absolute left-[2px] top-[9px] h-[6px] w-[3px] border-[1.3px]', bar)} />
      <span className={cn('absolute left-[6.5px] top-[6px] h-[9px] w-[3px] border-[1.3px]', bar)} />
      <span className={cn('absolute left-[11px] top-[3px] h-[12px] w-[3px] border-[1.3px]', bar)} />
    </span>
  )
}

function LotsGlyph({ active }: { active: boolean }) {
  const box = active ? 'border-maroon-50' : 'border-maroon-200'
  return (
    <span className="relative size-4 shrink-0">
      <span className={cn('absolute left-px top-[5px] size-[8px] rounded-[1px] border-[1.3px]', box)} />
      <span className={cn('absolute left-[7px] top-[3px] size-[8px] rounded-[1px] border-[1.3px]', box)} />
    </span>
  )
}

function TiersGlyph({ active }: { active: boolean }) {
  const bar = active ? 'border-maroon-50' : 'border-maroon-200'
  return (
    <span className="relative size-4 shrink-0">
      <span className={cn('absolute left-[3px] top-[2.5px] h-[2.4px] w-[10px] rounded-[1px] border-[1.3px]', bar)} />
      <span className={cn('absolute left-[3px] top-[6.8px] h-[2.4px] w-[10px] rounded-[1px] border-[1.3px]', bar)} />
      <span className={cn('absolute left-[3px] top-[11.1px] h-[2.4px] w-[10px] rounded-[1px] border-[1.3px]', bar)} />
    </span>
  )
}

type NavItem = {
  to: string
  label: string
  icon?: string
  glyph?: 'overview' | 'charts' | 'lots' | 'tiers'
}

type NavSection = { label?: string; items: NavItem[] }

const SECTIONS: NavSection[] = [
  { items: [{ to: '/admin', label: 'Overview', glyph: 'overview' }] },
  {
    label: 'INSIGHTS',
    items: [{ to: '/admin/analytics', label: 'Charts & analytics', glyph: 'charts' }],
  },
  {
    label: 'WORK QUEUES',
    items: [
      { to: '/admin/verification', label: 'Verification', icon: adminIcons.navVerification },
      { to: '/admin/settlements', label: 'Settlements · 12h', icon: adminIcons.navSettlements },
      { to: '/admin/proxy-placement', label: 'Proxy Placement', icon: adminIcons.navProxy },
      { to: '/admin/withdrawals', label: 'Withdrawals', icon: adminIcons.navWithdrawals },
      { to: '/admin/3pl-verification', label: '3PL verification', icon: adminIcons.nav3pl },
      { to: '/admin/support', label: 'Support', icon: adminIcons.navSupport },
    ],
  },
  {
    label: 'PEOPLE',
    items: [
      { to: '/admin/buyers', label: 'Buyers', icon: adminIcons.navBuyers },
      { to: '/admin/regulation', label: 'Regulation', icon: adminIcons.navRegulation },
    ],
  },
  {
    label: 'COMMERCE',
    items: [
      { to: '/admin/auctions', label: 'Auctions', icon: adminIcons.navAuctions },
      { to: '/admin/lots', label: 'Lots', glyph: 'lots' },
      { to: '/admin/orders', label: 'Orders', icon: adminIcons.navOrders },
      { to: '/admin/shipments', label: 'Shipments', icon: adminIcons.navShipments },
    ],
  },
  {
    label: 'MONEY',
    items: [{ to: '/admin/transactions', label: 'Transactions', icon: adminIcons.navTransactions }],
  },
  {
    label: 'GROWTH',
    items: [{ to: '/admin/referrals', label: 'Referrals & rewards', icon: adminIcons.navReferrals }],
  },
  {
    label: 'CONFIGURE',
    items: [
      { to: '/admin/fees', label: 'Fees & pricing', icon: adminIcons.navFees },
      { to: '/admin/tiers', label: 'Tiers', glyph: 'tiers' },
      { to: '/admin/sync', label: 'Sync & sources', icon: adminIcons.navSync },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/admin/audit', label: 'Audit log', icon: adminIcons.navAudit },
      { to: '/admin/users', label: 'Admin users', icon: adminIcons.navAdminUsers },
    ],
  },
]

function NavIcon({ item, active }: { item: NavItem; active: boolean }) {
  if (item.glyph === 'overview') return <OverviewGlyph active={active} />
  if (item.glyph === 'charts') return <ChartGlyph active={active} />
  if (item.glyph === 'lots') return <LotsGlyph active={active} />
  if (item.glyph === 'tiers') return <TiersGlyph active={active} />
  if (item.icon) {
    return (
      <span className="relative size-4 shrink-0 overflow-hidden">
        <img src={item.icon} alt="" width={16} height={16} className="block size-full max-w-none" />
      </span>
    )
  }
  return null
}

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-[min(100vw,264px)] shrink-0 flex-col bg-maroon-950 sm:w-[264px]">
      <div className="flex items-center justify-between gap-2 overflow-hidden border-b border-maroon-800 px-4 py-[18px]">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="h-7 w-[41px] shrink-0 overflow-hidden">
            <img src={adminLogo} alt="VSK" className="h-7 w-[41px] object-cover" />
          </div>
          <p className="text-[13px] leading-normal text-slate-500">Admin</p>
        </div>
        {onNavigate ? (
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-maroon-200 hover:bg-white/5 lg:hidden"
            aria-label="Close navigation"
            onClick={onNavigate}
          >
            <Icon src={icons.close} size={16} className="opacity-80 brightness-0 invert" />
          </button>
        ) : null}
      </div>
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-3">
        {SECTIONS.map((section) => (
          <div key={section.label ?? 'main'} className="flex flex-col gap-0.5">
            {section.label ? (
              <p className="px-2.5 py-1 text-[11px] font-medium text-maroon-400">{section.label}</p>
            ) : null}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] leading-normal',
                    isActive ? 'bg-[rgba(71,5,23,0.45)] text-maroon-300' : 'text-maroon-200 hover:bg-white/5',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <NavIcon item={item} active={isActive} />
                    <span className="min-w-0 flex-1">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
