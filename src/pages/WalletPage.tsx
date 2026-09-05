import { useMemo, useState } from 'react'
import { icons } from '@/assets'
import { Icon } from '@/components/shared/Icon'
import { Button } from '@/components/shared/Button'
import { PageHeader } from '@/components/shared/PageChrome'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { rotateDepositAddress, withdraw } from '@/store/slices/walletSlice'
import { showSuccess, showToast } from '@/store/slices/uiSlice'
import { cn } from '@/utils/format'
import type { WalletTx } from '@/types'
import walletAvailableIcon from '@/assets/icons/wallet-available.svg'
import walletReservedIcon from '@/assets/icons/wallet-reserved.svg'
import walletEscrowIcon from '@/assets/icons/wallet-escrow.svg'
import walletRefundsIcon from '@/assets/icons/wallet-refunds.svg'
import statementIcon from '@/assets/icons/statement.svg'
import depositIcon from '@/assets/icons/deposit.svg'
import withdrawIcon from '@/assets/icons/withdraw.svg'
import copyIcon from '@/assets/icons/copy.svg'
import infoIcon from '@/assets/icons/info.svg'

const PROVIDERS = [
  { id: 'circle-usdc', label: 'Circle — USDC (~2 min)', asset: 'USDC (ERC20)' },
  { id: 'fireblocks-usdt', label: 'Fireblocks — USDT (TRC20)', asset: 'USDT (TRC20)' },
  { id: 'coinbase-btc', label: 'Coinbase Custody — BTC', asset: 'BTC' },
  { id: 'wire-usd', label: 'Wire — USD (1–2 days)', asset: 'USD' },
] as const

function formatWalletMoney(amount: number, opts?: { signed?: boolean; forceCents?: boolean }) {
  const abs = Math.abs(amount)
  const hasCents = opts?.forceCents || abs % 1 !== 0
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(abs)
  if (!opts?.signed) return amount < 0 ? `-${formatted}` : formatted
  if (amount > 0) return `+${formatted}`
  if (amount < 0) return `-${formatted}`
  return formatted
}

function truncateAddress(addr: string) {
  if (addr.length <= 16) return addr
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`
}

function txIcon(type: WalletTx['type']) {
  if (type === 'deposit' || type === 'refund' || type === 'escrow_release') {
    return {
      bg: 'bg-[#e8f6ee]',
      fg: 'text-[#1f7a45]',
      symbol: '↑',
    }
  }
  if (type === 'escrow_hold') {
    return {
      bg: 'bg-[#f3e8ff]',
      fg: 'text-[#7c3aed]',
      symbol: '🔒',
    }
  }
  if (type === 'fee') {
    return {
      bg: 'bg-[#f3f4f6]',
      fg: 'text-[#6b7280]',
      symbol: '◎',
    }
  }
  return {
    bg: 'bg-[#fdebec]',
    fg: 'text-[#c62828]',
    symbol: '↓',
  }
}

function StatusPill({ status }: { status: WalletTx['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        status === 'completed' ? 'bg-[#e8f6ee] text-[#1f7a45]' : 'bg-[#fff6e5] text-[#b45309]',
      )}
    >
      {status}
    </span>
  )
}

export function WalletPage() {
  const dispatch = useAppDispatch()
  const wallet = useAppSelector((s) => s.wallet)
  const available = wallet.available
  const reserved = wallet.reserved ?? 12400
  const escrow = wallet.escrow
  const refundsDue = wallet.refundsDue ?? 1240
  const transactions = wallet.transactions
  const depositAddress = wallet.depositAddress ?? '0x8a3f71c2e9d04b5a1f6e8c21b9a0d447e2c91af3'

  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit')
  const [providerId, setProviderId] = useState<string>(PROVIDERS[0].id)
  const [query, setQuery] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawTo, setWithdrawTo] = useState('')

  const provider = PROVIDERS.find((p) => p.id === providerId) ?? PROVIDERS[0]
  const total = available + reserved + escrow + refundsDue

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return transactions
    return transactions.filter(
      (tx) =>
        tx.label.toLowerCase().includes(q) ||
        tx.asset.toLowerCase().includes(q) ||
        (tx.detail ?? '').toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q),
    )
  }, [transactions, query])

  const periodDeposits = transactions
    .filter((t) => t.amount > 0 && (t.type === 'deposit' || t.type === 'refund' || t.type === 'escrow_release'))
    .reduce((sum, t) => sum + t.amount, 0)
  const periodWithdrawals = Math.abs(
    transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0),
  )

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress)
      dispatch(showToast('Deposit address copied'))
    } catch {
      dispatch(showToast('Unable to copy address'))
    }
  }

  const exportCsv = () => {
    const header = 'Type,Asset,Amount,Status,Date,Detail\n'
    const rows = filtered
      .map(
        (tx) =>
          `${tx.label},${tx.asset},${tx.amount},${tx.status},${tx.date},"${tx.detail ?? ''}"`,
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wallet-activity.csv'
    a.click()
    URL.revokeObjectURL(url)
    dispatch(showToast('CSV exported'))
  }

  const cards = [
    {
      label: 'Available',
      value: formatWalletMoney(available, { forceCents: true }),
      foot: 'Ready to bid or withdraw',
      valueClass: 'text-[#1f7a45]',
      icon: (
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-[#f5f5f6]">
          <Icon src={walletAvailableIcon} size={16} />
        </span>
      ),
    },
    {
      label: 'Reserved',
      value: formatWalletMoney(reserved),
      foot: 'Held against active bids',
      valueClass: 'text-[#1a1e26]',
      icon: (
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-[#f5f5f6]">
          <Icon src={walletReservedIcon} size={16} />
        </span>
      ),
    },
    {
      label: 'In Escrow',
      value: formatWalletMoney(escrow, { forceCents: true }),
      foot: 'Releases on delivery',
      valueClass: 'text-[#1a1e26]',
      icon: (
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-[#f5f5f6]">
          <Icon src={walletEscrowIcon} size={16} />
        </span>
      ),
    },
    {
      label: 'Refunds Due',
      value: formatWalletMoney(refundsDue),
      foot: 'Credited within 24h',
      valueClass: 'text-[#1a1e26]',
      icon: (
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-[#f5f5f6]">
          <Icon src={walletRefundsIcon} size={16} />
        </span>
      ),
    },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Wallet"
        subtitle="Balances, escrow holds, and payment activity"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-10 items-center rounded-full bg-[#480516] px-4 text-[13px] font-medium text-white">
              Total balance: {formatWalletMoney(total, { forceCents: true })}
            </span>
            <Button
              variant="secondary"
              onClick={() => dispatch(showToast('Statement download started'))}
            >
              <Icon src={statementIcon} size={12} />
              Statement
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[#ebebec] bg-white px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#9ca3af]">{card.label}</p>
              {card.icon}
            </div>
            <p className={cn('mt-3 text-[26px] font-semibold tabular-nums leading-none', card.valueClass)}>
              {card.value}
            </p>
            <p className="mt-2 text-[12px] text-[#9ca3af]">{card.foot}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        {/* Move funds */}
        <section className="flex h-fit flex-col rounded-xl border border-[#ebebec] bg-white p-5">
          <h2 className="text-[16px] font-semibold text-[#1a1e26]">Move funds</h2>
          <p className="mt-1 text-[13px] text-[#9ca3af]">Crypto rails via integrated custody providers.</p>

          <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-[#f5f5f6] p-1">
            <button
              type="button"
              onClick={() => setMode('deposit')}
              className={cn(
                'inline-flex h-10 items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium transition',
                mode === 'deposit' ? 'bg-white text-[#1a1e26] shadow-sm' : 'text-[#7a7b7c]',
              )}
            >
              <Icon src={depositIcon} size={13} /> Deposit
            </button>
            <button
              type="button"
              onClick={() => setMode('withdraw')}
              className={cn(
                'inline-flex h-10 items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium transition',
                mode === 'withdraw' ? 'bg-white text-[#1a1e26] shadow-sm' : 'text-[#7a7b7c]',
              )}
            >
              <Icon src={withdrawIcon} size={13} /> Withdraw
            </button>
          </div>

          <label className="mt-5 block text-[12px] font-medium text-[#4b5563]">
            Provider
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[13px] text-[#1a1e26] outline-none focus:border-[#480516]"
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          {mode === 'deposit' ? (
            <>
              <label className="mt-4 block text-[12px] font-medium text-[#4b5563]">
                Deposit address
                <div className="relative mt-1.5">
                  <input
                    readOnly
                    value={truncateAddress(depositAddress)}
                    className="h-11 w-full rounded-xl border border-[#ebebec] bg-white py-2 pl-3 pr-16 font-mono text-[12px] text-[#1a1e26] outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#480516] hover:bg-[#f9f5f6]"
                  >
                    <Icon src={copyIcon} size={12} />
                    Copy
                  </button>
                </div>
              </label>

              <div className="mt-4 rounded-xl border border-[#f2d9a8] bg-[#fff8e6] px-3 py-3 text-[12px] leading-relaxed text-[#8a6116]">
                <span className="mr-1.5 inline-flex align-middle">
                  <Icon src={infoIcon} size={13} />
                </span>
                Send only the selected asset on the matching network. Deposits credit after 12 confirmations;
                wrong-network transfers cannot be recovered.
              </div>

              <Button
                className="mt-5 w-full"
                onClick={() => {
                  dispatch(rotateDepositAddress())
                  dispatch(showToast('New deposit address generated'))
                }}
              >
                Generate new address
              </Button>
            </>
          ) : (
            <>
              <label className="mt-4 block text-[12px] font-medium text-[#4b5563]">
                Amount (USD)
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[13px] outline-none focus:border-[#480516]"
                />
              </label>
              <label className="mt-4 block text-[12px] font-medium text-[#4b5563]">
                Destination address
                <input
                  value={withdrawTo}
                  onChange={(e) => setWithdrawTo(e.target.value)}
                  placeholder="0x… or wallet address"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-3 font-mono text-[12px] outline-none focus:border-[#480516]"
                />
              </label>
              <p className="mt-3 text-[12px] text-[#9ca3af]">
                Available: {formatWalletMoney(available, { forceCents: true })}
              </p>
              <Button
                className="mt-5 w-full"
                onClick={() => {
                  const amount = Number(withdrawAmount)
                  if (!amount || amount <= 0) {
                    dispatch(showToast('Enter a valid amount'))
                    return
                  }
                  if (amount > available) {
                    dispatch(showToast('Insufficient available balance'))
                    return
                  }
                  if (!withdrawTo.trim()) {
                    dispatch(showToast('Enter a destination address'))
                    return
                  }
                  dispatch(
                    withdraw({
                      amount,
                      asset: provider.asset,
                      detail: truncateAddress(withdrawTo.trim()),
                    }),
                  )
                  setWithdrawAmount('')
                  setWithdrawTo('')
                  dispatch(
                    showSuccess({
                      title: 'Withdrawal submitted',
                      body: `${formatWalletMoney(amount)} withdrawal to ${provider.label} is pending confirmation.`,
                      actionLabel: 'Done',
                    }),
                  )
                }}
              >
                Withdraw
              </Button>
            </>
          )}
        </section>

        {/* Activity */}
        <section className="overflow-hidden rounded-xl border border-[#ebebec] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#ebebec] px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-[#1a1e26]">Wallet activity</h2>
              <p className="mt-1 text-[13px] text-[#7a7b7c]">
                Deposits{' '}
                <span className="font-medium text-[#1f7a45]">
                  {formatWalletMoney(periodDeposits, { signed: true })}
                </span>{' '}
                · withdrawals{' '}
                <span className="font-medium text-[#c62828]">
                  -{formatWalletMoney(periodWithdrawals)}
                </span>{' '}
                this period
              </p>
            </div>
            <div className="relative shrink-0">
              <Icon
                src={icons.search}
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transactions..."
                className="h-9 w-full rounded-lg border border-[#ebebec] bg-white pl-8 pr-3 text-[13px] outline-none focus:border-[#480516] sm:w-[220px]"
              />
            </div>
          </div>

          <div className="hidden border-b border-[#ebebec] px-5 py-2 text-[11px] font-medium uppercase tracking-wide text-[#9ca3af] md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_110px_100px_80px]">
            <span>Type</span>
            <span>Asset</span>
            <span className="text-right">Amount</span>
            <span className="text-center">Status</span>
            <span className="text-right">Date</span>
          </div>

          <div>
            {filtered.length === 0 ? (
              <p className="px-5 py-10 text-center text-[14px] text-[#9ca3af]">No matching transactions</p>
            ) : (
              filtered.map((tx) => {
                const icon = txIcon(tx.type)
                const inflow = tx.amount > 0
                return (
                  <div
                    key={tx.id}
                    className="grid grid-cols-1 items-center gap-3 border-b border-[#ebebec] px-5 py-3.5 last:border-b-0 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_110px_100px_80px]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm',
                          icon.bg,
                          icon.fg,
                        )}
                      >
                        {icon.symbol}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium text-[#1a1e26]">{tx.label}</p>
                        {tx.detail ? (
                          <p className="truncate text-[12px] text-[#9ca3af]">{tx.detail}</p>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-[13px] text-[#4b5563]">{tx.asset}</p>
                    <p
                      className={cn(
                        'text-[14px] font-semibold tabular-nums md:text-right',
                        inflow ? 'text-[#1f7a45]' : 'text-[#1a1e26]',
                      )}
                    >
                      {formatWalletMoney(tx.amount, { signed: true, forceCents: Math.abs(tx.amount) % 1 !== 0 })}
                    </p>
                    <div className="md:flex md:justify-center">
                      <StatusPill status={tx.status} />
                    </div>
                    <p className="text-[13px] text-[#7a7b7c] md:text-right">{tx.date}</p>
                  </div>
                )
              })
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[#ebebec] px-5 py-3">
            <p className="text-[12px] text-[#9ca3af]">
              Showing {filtered.length} of {transactions.length} transactions
            </p>
            <button
              type="button"
              onClick={exportCsv}
              className="text-[13px] font-medium text-[#480516] hover:underline"
            >
              Export CSV →
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
