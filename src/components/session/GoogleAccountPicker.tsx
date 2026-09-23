import { createPortal } from 'react-dom'
import { Icon } from '@/components/shared/Icon'
import googleIcon from '@/assets/icons/google.svg'
import { googleAccountsFor, type GoogleAccount } from '@/session/googleAuth'

export function GoogleAccountPicker({
  open,
  suggested,
  onClose,
  onSelect,
}: {
  open: boolean
  suggested?: Partial<GoogleAccount>
  onClose: () => void
  onSelect: (account: GoogleAccount) => void
}) {
  if (!open) return null

  const accounts = googleAccountsFor(suggested)

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#1a1e26]/55 px-4 py-6 sm:items-center" role="dialog" aria-modal aria-label="Choose a Google account">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-[400px] overflow-hidden rounded-2xl border border-[#ebebec] bg-white shadow-[0px_16px_40px_rgba(26,30,38,0.18)]">
        <div className="flex items-center gap-3 border-b border-[#ebebec] px-5 py-4">
          <Icon src={googleIcon} size={18} />
          <div className="min-w-0">
            <p className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Continue with Google</p>
            <p className="text-[13px] leading-5 text-[#7a7b7c]">Choose an account to create your VSK profile</p>
          </div>
        </div>
        <div className="py-2">
          {accounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => onSelect(account)}
              className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[#f8f8f9]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f9f5f6] text-[13px] font-semibold text-[#480516]">
                {account.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-medium text-[#1a1e26]">{account.name}</span>
                <span className="block truncate text-[13px] text-[#7a7b7c]">{account.email}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="border-t border-[#ebebec] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] font-medium text-[#7a7b7c] hover:text-[#1a1e26]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
