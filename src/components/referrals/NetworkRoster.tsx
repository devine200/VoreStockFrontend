import { ReferralStatusBadge } from '@/components/referrals/ReferralStatusBadge'
import { Icon } from '@/components/shared/Icon'
import usersIcon from '@/assets/icons/users.svg'
import infoIcon from '@/assets/icons/info.svg'
import type { ReferralContact } from '@/types'

export function NetworkRoster({
  contacts,
  activeCount,
}: {
  contacts: ReferralContact[]
  activeCount: number
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#f9f5f6] text-[#480516]">
            <Icon src={usersIcon} size={20} />
          </span>
          <div>
            <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Network Roster</h2>
            <p className="text-[13px] text-[#7a7b7c]">
              {contacts.length} contacts invited · {activeCount} active
            </p>
          </div>
        </div>
        <p className="flex items-start gap-2 text-[12px] leading-4 text-[#9ca3af] sm:max-w-[240px] sm:text-right">
          <Icon src={infoIcon} size={14} />
          Rewards earned once a qualifying purchase is completed.
        </p>
      </div>

      <div className="lg:hidden">
        {contacts.map((contact) => (
          <div key={contact.id} className="border-t border-[#ebebec] px-4 py-3.5">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f9f5f6] text-[12px] font-semibold text-[#480516]">
                {contact.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium leading-5 text-[#1a1e26]">{contact.name}</p>
                    <p className="truncate text-[12px] text-[#9ca3af]">{contact.company}</p>
                  </div>
                  <ReferralStatusBadge status={contact.status} />
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-xl bg-[#f8f8f9]">
              <div className="px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.4px] text-[#9ca3af]">Email</p>
                <p className="mt-0.5 truncate text-[12px] text-[#1a1e26]">{contact.email}</p>
              </div>
              <div className="border-l border-[#ebebec] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.4px] text-[#9ca3af]">Invited</p>
                <p className="mt-0.5 text-[12px] text-[#1a1e26]">{contact.invitedAt}</p>
              </div>
              <div className="border-t border-[#ebebec] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.4px] text-[#9ca3af]">Reward</p>
                <p className="mt-0.5 text-[13px] font-semibold">
                  {contact.reward != null ? (
                    <span className="text-[#0a6e38]">+${contact.reward}</span>
                  ) : (
                    <span className="text-[#9ca3af]">—</span>
                  )}
                </p>
              </div>
              <div className="border-t border-l border-[#ebebec] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.4px] text-[#9ca3af]">Status</p>
                <p className="mt-0.5 text-[12px] text-[#1a1e26]">
                  {contact.status === 'reward_earned' ? 'Reward earned' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-y border-[#ebebec] text-[11px] font-medium tracking-[0.08em] text-[#9ca3af] uppercase">
              <th className="px-6 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Date Invited</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Reward</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b border-[#ebebec] last:border-b-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f9f5f6] text-[12px] font-semibold text-[#480516]">
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
                    <span className="text-[#0a6e38]">+${contact.reward}</span>
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
