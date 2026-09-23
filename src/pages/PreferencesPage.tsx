import { useLayoutEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/shared/Button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updatePrefs } from '@/store/slices/accountSlices'
import { showSuccess } from '@/store/slices/uiSlice'
import { cn } from '@/utils/format'

const CATEGORIES = [
  'Heavy Equipment',
  'Electronics',
  'Commercial Vehicles',
  'Building Materials',
  'Cannabis',
  'Apparel',
  'Furniture',
  'Industrial',
  'Medical Equipment',
  'Agriculture',
]

const CONDITIONS = [
  'New',
  'Used — Like New',
  'Used — Good',
  'Used — Fair',
  'Customer Returns',
  'Salvage',
]

const AUCTION_TYPES = ['Live Auction', 'Timed Auction', 'Buy Now', 'Make Offer', 'Reserve Auction']

const DURATIONS = ['Under 24 hours', '1-3 days', '3-7 days', '7-14 days', '14+ days']

const SHIPPING = [
  'International freight',
  'Seller arranges',
  'Domestic only',
  'Local pickup',
  'Buyer arranges',
]

function toggleInList(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function Chip({
  label,
  selected,
  onClick,
  locked,
}: {
  label: string
  selected: boolean
  onClick: () => void
  locked?: boolean
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      className={cn(
        'inline-flex h-[30px] items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition',
        selected
          ? 'border border-[#480516] bg-[#f9f5f6] text-[#480516]'
          : 'border border-transparent bg-[#f3f4f6] text-[#4b5563] hover:bg-[#ebebec]',
        locked && 'cursor-default opacity-90',
      )}
    >
      {selected ? <span aria-hidden>✓</span> : null}
      {label}
    </button>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full transition',
        checked ? 'bg-[#480516]' : 'bg-[#d1d5db]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition',
          checked && 'translate-x-4',
        )}
      />
    </button>
  )
}

function SectionCard({
  id,
  title,
  subtitle,
  editing,
  onEdit,
  children,
}: {
  id?: string
  title: string
  subtitle: string
  editing?: boolean
  onEdit?: () => void
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 overflow-hidden rounded-2xl border border-[#ebebec] bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">{title}</h2>
          <p className="mt-0.5 text-[13px] leading-4 text-[#9ca3af]">{subtitle}</p>
        </div>
        {onEdit ? (
          <Button type="button" variant="soft" className="h-10 w-[74px] shrink-0 px-0 text-[13px]" onClick={onEdit}>
            {editing ? 'Done' : 'Edit'}
          </Button>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-[13px] font-medium text-[#1a1e26]">{children}</p>
}

const inputClass =
  'h-[42px] w-full rounded-xl border border-[#ebebec] bg-white px-3 text-[14px] outline-none focus:border-[#480516] disabled:bg-[#f9fafb]'

export function PreferencesPage() {
  const dispatch = useAppDispatch()
  const prefs = useAppSelector((s) => s.profile)

  const [categories, setCategories] = useState(prefs.categories ?? [])
  const [conditions, setConditions] = useState(prefs.conditions ?? [])
  const [auctionTypes, setAuctionTypes] = useState(prefs.auctionTypes ?? [])
  const [priceMin, setPriceMin] = useState(String(prefs.priceMin ?? 1000))
  const [priceMax, setPriceMax] = useState(String(prefs.priceMax ?? 200000))
  const [auctionDurations, setAuctionDurations] = useState(prefs.auctionDurations ?? [])
  const [bidMin, setBidMin] = useState(String(prefs.bidMin ?? 5000))
  const [bidMax, setBidMax] = useState(String(prefs.bidMax ?? 150000))
  const [deliveryCountry, setDeliveryCountry] = useState(prefs.deliveryCountry ?? 'Nigeria')
  const [shippingPrefs, setShippingPrefs] = useState(prefs.shippingPrefs ?? [])
  const [personalizedRecs, setPersonalizedRecs] = useState(prefs.personalizedRecs ?? true)
  const [savedSearchAlerts, setSavedSearchAlerts] = useState(prefs.savedSearchAlerts ?? true)
  const [newListingAlerts, setNewListingAlerts] = useState(prefs.newListingAlerts ?? true)

  const location = useLocation()
  const [editProduct, setEditProduct] = useState(true)
  const [editBidding, setEditBidding] = useState(true)
  const [editLocation, setEditLocation] = useState(true)

  useLayoutEffect(() => {
    if (location.hash !== '#location') return
    setEditLocation(true)
    requestAnimationFrame(() => {
      document.getElementById('location')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.hash])

  const save = () => {
    dispatch(
      updatePrefs({
        categories,
        conditions,
        auctionTypes,
        priceMin: Number(priceMin) || 0,
        priceMax: Number(priceMax) || 0,
        auctionDurations,
        bidMin: Number(bidMin) || 0,
        bidMax: Number(bidMax) || 0,
        deliveryCountry,
        shippingPrefs,
        personalizedRecs,
        savedSearchAlerts,
        newListingAlerts,
      }),
    )
    dispatch(
      showSuccess({
        title: 'Preference Saved',
        body: 'Your preference has been saved.',
        actionLabel: 'Done',
      }),
    )
  }

  return (
    <div className="animate-fade-in min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Button onClick={save} className="h-10 w-full shrink-0 sm:order-2 sm:w-auto">
          Save preferences
        </Button>
        <div className="min-w-0 sm:order-1">
          <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">
            Buying Preferences
          </h1>
          <p className="pt-1 text-[14px] leading-5 text-[#7a7b7c]">
            Personalise your marketplace experience and improve recommendations
          </p>
        </div>
      </div>

      <SectionCard
        title="Product preferences"
        subtitle="We use these to surface the most relevant lots for you."
        editing={editProduct}
        onEdit={() => setEditProduct((v) => !v)}
      >
        <div className="space-y-5">
          <div>
            <FieldLabel>Categories</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={categories.includes(c)}
                  locked={!editProduct}
                  onClick={() => editProduct && setCategories((prev) => toggleInList(prev, c))}
                />
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Item condition</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={conditions.includes(c)}
                  locked={!editProduct}
                  onClick={() => editProduct && setConditions((prev) => toggleInList(prev, c))}
                />
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Auction type</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {AUCTION_TYPES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={auctionTypes.includes(c)}
                  locked={!editProduct}
                  onClick={() => editProduct && setAuctionTypes((prev) => toggleInList(prev, c))}
                />
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Preferred price range</FieldLabel>
            <div className="grid max-w-md grid-cols-2 items-center gap-2">
              <input
                type="number"
                disabled={!editProduct}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="$ Min"
                className={inputClass}
              />
              <input
                type="number"
                disabled={!editProduct}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="$ Max"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Bidding preferences"
        subtitle="Control how you participate in auctions."
        editing={editBidding}
        onEdit={() => setEditBidding((v) => !v)}
      >
        <div className="space-y-5">
          <div>
            <FieldLabel>Preferred auction duration</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={auctionDurations.includes(c)}
                  locked={!editBidding}
                  onClick={() => editBidding && setAuctionDurations((prev) => toggleInList(prev, c))}
                />
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Preferred bid range</FieldLabel>
            <div className="grid max-w-md grid-cols-2 items-center gap-2">
              <input
                type="number"
                disabled={!editBidding}
                value={bidMin}
                onChange={(e) => setBidMin(e.target.value)}
                placeholder="$ Min"
                className={inputClass}
              />
              <input
                type="number"
                disabled={!editBidding}
                value={bidMax}
                onChange={(e) => setBidMax(e.target.value)}
                placeholder="$ Max"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="location"
        title="Location & delivery"
        subtitle="Affects landed cost estimates and available lots."
        editing={editLocation}
        onEdit={() => setEditLocation((v) => !v)}
      >
        <div className="space-y-5">
          <div>
            <FieldLabel>Delivery country</FieldLabel>
            <input
              disabled={!editLocation}
              value={deliveryCountry}
              onChange={(e) => setDeliveryCountry(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel>Shipping preferences</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {SHIPPING.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={shippingPrefs.includes(c)}
                  locked={!editLocation}
                  onClick={() => editLocation && setShippingPrefs((prev) => toggleInList(prev, c))}
                />
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Discovery preferences"
        subtitle="Control how lots and recommendations are surfaced to you."
      >
        <div className="divide-y divide-[#ebebec]">
          {(
            [
              {
                title: 'Personalised recommendations',
                desc: 'Show lots based on your bidding history and preferences',
                value: personalizedRecs,
                set: setPersonalizedRecs,
              },
              {
                title: 'Saved search alerts',
                desc: 'Notify me when new lots match my saved searches',
                value: savedSearchAlerts,
                set: setSavedSearchAlerts,
              },
              {
                title: 'New listing alerts',
                desc: 'Alert me when new lots are added in my preferred categories',
                value: newListingAlerts,
                set: setNewListingAlerts,
              },
            ] as const
          ).map((row) => (
            <div key={row.title} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-[#1a1e26]">{row.title}</p>
                <p className="mt-0.5 text-[13px] text-[#9ca3af]">{row.desc}</p>
              </div>
              <Toggle label={row.title} checked={row.value} onChange={row.set} />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
