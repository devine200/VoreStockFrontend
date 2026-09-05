import { ReferralStatusBadge } from '@/components/referrals/ReferralStatusBadge'
import { Icon } from '@/components/shared/Icon'
import usersIcon from '@/assets/icons/users.svg'
import infoIcon from '@/assets/icons/info.svg'
import type { ReferralContact } from '@/types'

function UsersIcon() {
  return <Icon src={usersIcon} size={20} />
}

export function NetworkRoster({
  contacts,
  activeCount,
}: {
  contacts: ReferralContact[]
  activeCount: number
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-wine-50 text-wine-500">
            <UsersIcon />
          </span>
          <div>
            <h2 className="text-[16px] font-semibold text-[#1a1e26]">Network Roster</h2>
            <p className="text-[13px] text-[#7a7b7c]">
              {contacts.length} contacts invited · {activeCount} active
            </p>
          </div>
        </div>
        <p className="flex items-center gap-2 text-[12px] text-[#9ca3af]">
          <Icon src={infoIcon} size={14} />
          Rewards earned once a qualifying purchase is completed.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="border-y border-border text-[11px] font-medium tracking-[0.08em] text-[#9ca3af] uppercase">
              <th className="px-6 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Date Invited</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Reward</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b border-border last:border-b-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-wine-50 text-[12px] font-semibold text-wine-500">
                      {contact.initials}
                    </span>
                    <span>
                      <span className="block text-[14px] font-medium text-[#1a1e26]">{contact.name}</span>
                      <span className="block text-[12px] text-[#9ca3af]">{contact.company}</span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-[14px] text-[#4b5563]">{contact.email}</td>
                <td className="px-4 py-4 text-[14px] text-[#4b5563]">{contact.invitedAt}</td>
                <td className="px-4 py-4">
                  <ReferralStatusBadge status={contact.status} />
                </td>
                <td className="px-6 py-4 text-right text-[14px] font-medium">
                  {contact.reward != null ? (
                    <span className="text-[#1f7a45]">+${contact.reward}</span>
                  ) : (
                    <span className="text-[#9ca3af]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
