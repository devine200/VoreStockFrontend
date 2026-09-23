import { EmptyState } from '@/components/shared/PageChrome'
import { Icon } from '@/components/shared/Icon'
import { ContractStatusBadge } from '@/components/contracts/ContractStatusBadge'
import { cn } from '@/utils/format'
import type { Contract } from '@/types'
import fileIcon from '@/assets/icons/file.svg'

export function ContractsSidebar({
  contracts,
  selectedId,
  onSelect,
}: {
  contracts: Contract[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <aside className="flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#ebebec] bg-white lg:w-[340px] lg:shrink-0">
      <div className="border-b border-[#ebebec] px-4 py-4">
        <h2 className="text-[14px] font-semibold leading-5 text-[#1a1e26]">All contracts</h2>
      </div>
      {contracts.length === 0 ? (
        <div className="p-4">
          <EmptyState title="No contracts" body="Contracts appear here after you win and settle a lot." />
        </div>
      ) : (
        <div className="space-y-1 p-3">
          {contracts.map((contract) => {
            const active = contract.id === selectedId
            return (
              <button
                key={contract.id}
                type="button"
                onClick={() => onSelect(contract.id)}
                className={cn(
                  'flex w-full min-w-0 items-start gap-3 rounded-xl px-[19px] py-[17px] text-left transition',
                  active
                    ? 'border border-[#480516] bg-[#fdfbfb]'
                    : 'border border-transparent hover:bg-[#fafafa]',
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f8f8f9]">
                  <Icon src={fileIcon} size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold leading-[17px] text-[#1a1e26] line-clamp-2">
                    {contract.title}
                  </span>
                  <span className="mt-1 block text-[12px] leading-[15px] text-[#7a7b7c]">
                    {contract.contractNumber}
                    {contract.orderId ? ` · ${contract.orderId}` : ''}
                  </span>
                  <span className="mt-2 inline-flex">
                    <ContractStatusBadge status={contract.status} />
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </aside>
  )
}
