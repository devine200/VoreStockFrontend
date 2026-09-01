import { ReferralStatusBadge } from '@/components/referrals/ReferralStatusBadge'
import type { ReferralContact } from '@/types'

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 19c.6-3 3-5 5.5-5s4.9 2 5.5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16.2 14.2c2 .4 3.8 1.8 4.3 4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
            <path d="M12 11v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="12" cy="8" r="0.9" fill="currentColor" />
          </svg>
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
