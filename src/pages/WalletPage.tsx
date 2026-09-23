import { useMemo, useState } from 'react'
import { icons } from '@/assets'
import { Icon } from '@/components/shared/Icon'
import { Button } from '@/components/shared/Button'
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

function TxGlyph({ type }: { type: WalletTx['type'] }) {
  if (type === 'escrow_hold') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M8 1.8 3.2 3.7v4.1c0 3 2.1 4.9 4.8 5.7 2.7-.8 4.8-2.7 4.8-5.7V3.7L8 1.8Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (type === 'fee') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="5.2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 5v3.2L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    )
  }
  if (type === 'withdrawal') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 3.2v9.6M4.8 9.6 8 12.8l3.2-3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 12.8V3.2M4.8 6.4 8 3.2l3.2 3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function txIcon(type: WalletTx['type']) {
  if (type === 'deposit' || type === 'refund' || type === 'escrow_release') {
    return { bg: 'bg-[#e8f6ee]', fg: 'text-[#0a6e38]' }
  }
  if (type === 'escrow_hold') {
    return { bg: 'bg-[#f3e8ff]', fg: 'text-[#7c3aed]' }
  }
  if (type === 'fee') {
    return { bg: 'bg-[#f3f4f6]', fg: 'text-[#6b7280]' }
  }
  return { bg: 'bg-[#fdebec]', fg: 'text-[#c62828]' }
}

function StatusPill({ status }: { status: WalletTx['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium leading-[17px]',
        status === 'completed' ? 'bg-[#e8f6ee] text-[#0a6e38]' : 'bg-[#fff6e5] text-[#b45309]',
      )}
    >
      {status === 'completed' ? 'Completed' : 'Pending'}
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
      valueClass: 'text-[#0a6e38]',
      icon: walletAvailableIcon,
    },
    {
      label: 'Reserved',
      value: formatWalletMoney(reserved),
      foot: 'Held against active bids',
      valueClass: 'text-[#480516]',
      icon: walletReservedIcon,
    },
    {
      label: 'In Escrow',
      value: formatWalletMoney(escrow, { forceCents: true }),
      foot: 'Releases on delivery',
      valueClass: 'text-[#480516]',
      icon: walletEscrowIcon,
    },
    {
      label: 'Refunds Due',
      value: formatWalletMoney(refundsDue),
      foot: 'Credited within 24h',
      valueClass: 'text-[#480516]',
      icon: walletRefundsIcon,
    },
  ]

  return (
    <div className="animate-fade-in min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">Wallet</h1>
          <p className="pt-1 text-[14px] leading-5 text-[#7a7b7c]">
            Balances, escrow holds, and payment activity
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-[34px] items-center rounded-xl border border-[#dacdd0] bg-[#b69ba2] px-4 text-[12px] leading-4 text-[#480516]">
            Total balance:{' '}
            <span className="ml-1 font-semibold">
              {formatWalletMoney(total, { forceCents: true })}
            </span>
          </span>
          <button
            type="button"
            onClick={() => dispatch(showToast('Statement download started'))}
            className="inline-flex h-[34px] items-center gap-2 rounded-xl border border-[#ebebec] bg-[#f5f5f6] px-4 text-[12px] font-medium text-[#46494f] hover:bg-[#eeeef0]"
          >
            <Icon src={statementIcon} size={12} />
            Statement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[#ebebec] bg-white p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium uppercase tracking-[1.1px] text-[#9d9ea2]">{card.label}</p>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f6]">
                <Icon src={card.icon} size={16} />
              </span>
            </div>
            <p
              className={cn(
                'truncate text-[22px] font-semibold tabular-nums leading-[30px] tracking-[-1px] sm:text-[30px]',
                card.valueClass,
              )}
            >
              {card.value}
            </p>
            <p className="text-[12px] leading-4 text-[#7a7b7c]">{card.foot}</p>
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start">
        <section className="flex h-fit w-full flex-col rounded-2xl border border-[#ebebec] bg-white p-5 lg:w-[401px] lg:shrink-0 lg:p-6">
          <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Move funds</h2>
          <p className="mt-0.5 text-[13px] leading-[18px] text-[#7a7b7c]">
            Crypto rails via integrated custody providers.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-[#f5f5f6] p-1">
            <button
              type="button"
              onClick={() => setMode('deposit')}
              className={cn(
                'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium transition',
                mode === 'deposit' ? 'bg-white text-[#1a1e26] shadow-sm' : 'text-[#7a7b7c]',
              )}
            >
              <Icon src={depositIcon} size={13} /> Deposit
            </button>
            <button
              type="button"
              onClick={() => setMode('withdraw')}
              className={cn(
                'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium transition',
                mode === 'withdraw' ? 'bg-white text-[#1a1e26] shadow-sm' : 'text-[#7a7b7c]',
              )}
            >
              <Icon src={withdrawIcon} size={13} /> Withdraw
            </button>
          </div>

          <label className="mt-5 block text-[12px] font-medium text-[#46494f]">
            Provider
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-4 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516]"
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
              <label className="mt-4 block text-[12px] font-medium text-[#46494f]">
                Deposit address
                <div className="relative mt-1.5">
                  <input
                    readOnly
                    value={truncateAddress(depositAddress)}
                    className="h-[52px] w-full rounded-xl border border-[#ebebec] bg-[#f8f8f9] py-2 pl-4 pr-[88px] font-mono text-[12px] text-[#7a7b7c] outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="absolute right-2.5 top-1/2 inline-flex h-[30px] -translate-y-1/2 items-center gap-1 rounded-lg border border-[#ebebec] bg-white px-2.5 text-[12px] font-medium text-[#1a1e26] hover:bg-[#f9f5f6]"
                  >
                    <Icon src={copyIcon} size={12} />
                    Copy
                  </button>
                </div>
              </label>

              <div className="mt-4 flex gap-2 rounded-xl border border-[#f2d9a8] bg-[#fff8e6] px-4 py-3.5 text-[12px] leading-[19px] text-[#8a6116]">
                <span className="mt-0.5 shrink-0">
                  <Icon src={infoIcon} size={14} />
                </span>
                <p>
                  Send only the selected asset on the matching network. Deposits credit after 12
                  confirmations; wrong-network transfers cannot be recovered.
                </p>
              </div>

              <Button
                className="mt-5 h-11 w-full text-[14px] font-semibold !bg-[#480516]"
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
              <label className="mt-4 block text-[12px] font-medium text-[#46494f]">
                Amount (USD)
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-4 text-[14px] outline-none focus:border-[#480516]"
                />
              </label>
              <label className="mt-4 block text-[12px] font-medium text-[#46494f]">
                Destination address
                <input
                  value={withdrawTo}
                  onChange={(e) => setWithdrawTo(e.target.value)}
                  placeholder="0x… or wallet address"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#ebebec] bg-white px-4 font-mono text-[12px] outline-none focus:border-[#480516]"
                />
              </label>
              <p className="mt-3 text-[12px] text-[#9ca3af]">
                Available: {formatWalletMoney(available, { forceCents: true })}
              </p>
              <Button
                className="mt-5 h-11 w-full text-[14px] font-semibold !bg-[#480516]"
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

        <section className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
          <div className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Wallet activity</h2>
              <p className="mt-1 text-[13px] leading-5 text-[#7a7b7c]">
                Deposits{' '}
                <span className="font-medium text-[#0a6e38]">
                  {formatWalletMoney(periodDeposits, { signed: true })}
                </span>{' '}
                · withdrawals{' '}
                <span className="font-medium text-[#c62828]">
                  -{formatWalletMoney(periodWithdrawals)}
                </span>{' '}
                this period
              </p>
            </div>
            <div className="relative w-full shrink-0 sm:w-[200px]">
              <Icon
                src={icons.search}
                size={12}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transactions…"
                className="h-[30px] w-full rounded-full border border-[#ebebec] bg-[#f8f8f9] pl-8 pr-3 text-[12px] outline-none placeholder:text-[#9ca3af] focus:border-[#dacdd0] focus:bg-white"
              />
            </div>
          </div>

          <div className="hidden border-y border-[#ebebec] bg-[#fafafa] px-6 py-3 text-[11px] font-medium uppercase tracking-wide text-[#9d9ea2] lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_110px_100px_80px]">
            <span>Type</span>
            <span className="text-center">Asset</span>
            <span className="text-center">Amount</span>
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
                  <div key={tx.id} className="border-b border-[#ebebec] last:border-b-0">
                    <div className="flex items-center gap-3 px-4 py-3.5 lg:hidden">
                      <span
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-full',
                          icon.bg,
                          icon.fg,
                        )}
                      >
                        <TxGlyph type={tx.type} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium leading-5 text-[#1a1e26]">{tx.label}</p>
                        <p className="mt-0.5 truncate text-[12px] text-[#9ca3af]">
                          {tx.detail ? `${tx.detail} · ` : ''}
                          {tx.asset} · {tx.date}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 bg-[#f8f8f9] lg:hidden">
                      <div className="px-4 py-2.5">
                        <p className="text-[10px] uppercase tracking-[0.4px] text-[#9ca3af]">Amount</p>
                        <p
                          className={cn(
                            'mt-0.5 text-[13px] font-semibold tabular-nums',
                            inflow ? 'text-[#0a6e38]' : 'text-[#1a1e26]',
                          )}
                        >
                          {formatWalletMoney(tx.amount, {
                            signed: true,
                            forceCents: Math.abs(tx.amount) % 1 !== 0,
                          })}
                        </p>
                      </div>
                      <div className="border-l border-[#ebebec] px-4 py-2.5">
                        <p className="text-[10px] uppercase tracking-[0.4px] text-[#9ca3af]">Status</p>
                        <div className="mt-0.5">
                          <StatusPill status={tx.status} />
                        </div>
                      </div>
                    </div>

                    <div className="hidden items-center px-6 py-[14px] lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_110px_100px_80px]">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            'flex size-8 shrink-0 items-center justify-center rounded-full',
                            icon.bg,
                            icon.fg,
                          )}
                        >
                          <TxGlyph type={tx.type} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium leading-5 text-[#1a1e26]">{tx.label}</p>
                          {tx.detail ? (
                            <p className="truncate text-[12px] leading-[17px] text-[#9ca3af]">{tx.detail}</p>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-center text-[13px] text-[#4b5563]">{tx.asset}</p>
                      <p
                        className={cn(
                          'text-center text-[14px] font-semibold tabular-nums',
                          inflow ? 'text-[#0a6e38]' : 'text-[#1a1e26]',
                        )}
                      >
                        {formatWalletMoney(tx.amount, {
                          signed: true,
                          forceCents: Math.abs(tx.amount) % 1 !== 0,
                        })}
                      </p>
                      <div className="flex justify-center">
                        <StatusPill status={tx.status} />
                      </div>
                      <p className="text-right text-[13px] text-[#7a7b7c]">{tx.date}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="text-[12px] text-[#9ca3af]">
              Showing {filtered.length} of {transactions.length} transactions
            </p>
            <button
              type="button"
              onClick={exportCsv}
              className="shrink-0 text-[13px] font-medium text-[#480516] hover:underline"
            >
              Export CSV →
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
