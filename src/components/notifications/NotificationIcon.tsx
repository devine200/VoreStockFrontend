import type { NotificationCategory } from '@/types'
import { Icon } from '@/components/shared/Icon'
import notifBid from '@/assets/icons/notif-bid.svg'
import notifAuction from '@/assets/icons/notif-auction.svg'
import notifOrder from '@/assets/icons/notif-order.svg'
import notifWallet from '@/assets/icons/notif-wallet.svg'
import notifAccount from '@/assets/icons/notif-account.svg'

const WRAP: Record<NotificationCategory, string> = {
  bid: 'bg-[#fff1f1]',
  auction: 'bg-[#e8f0fb]',
  order: 'bg-[#e6f4ed]',
  wallet: 'bg-[#f9f5f6]',
  account: 'bg-[#fef3c7]',
}

const ICONS: Record<NotificationCategory, string> = {
  bid: notifBid,
  auction: notifAuction,
  order: notifOrder,
  wallet: notifWallet,
  account: notifAccount,
}

export function NotificationIcon({ type }: { type: NotificationCategory }) {
  return (
    <span className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${WRAP[type]}`}>
      <Icon src={ICONS[type]} size={16} />
    </span>
  )
}
