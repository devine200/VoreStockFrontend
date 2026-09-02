import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getLot } from '@/api/fixtures'
import { useAppSelector } from '@/store/hooks'
import { lotDisplayCode } from '@/utils/format'

const DEFAULT_TITLE = 'VSK Global — Auction & Liquidation Hub'
const DEFAULT_DESCRIPTION =
  'VSK Global is a premium auction and liquidation marketplace for serious buyers. Bid on verified lots — heavy equipment, electronics, bulk pallets, and more — with secure escrow, landed-cost clarity, and end-to-end shipment tracking.'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(json: string | null) {
  const id = 'route-seo-jsonld'
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!json) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = json
}

function absoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith('http')) return pathOrUrl
  const origin = window.location.origin
  if (pathOrUrl.startsWith('/')) return `${origin}${pathOrUrl}`
  return `${origin}/${pathOrUrl}`
}

export function SeoHead() {
  const { pathname } = useLocation()
  const lots = useAppSelector((s) => s.auctions.lots)
  const lotParam = pathname.match(/^\/lots\/([^/]+)/)?.[1]
  const lot = lotParam
    ? lots.find((l) => l.id === lotParam || l.slug === lotParam) ?? getLot(lotParam)
    : undefined
  const isBids = pathname === '/bids'

  useLayoutEffect(() => {
    let title = DEFAULT_TITLE
    let description = DEFAULT_DESCRIPTION
    let image: string | undefined
    let jsonLd: string | null = null

    if (lot) {
      title = `${lot.title} | VSK Global`
      description = lot.description || lot.subtitle || DEFAULT_DESCRIPTION
      image = lot.image
      jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: lot.title,
        description,
        image: absoluteUrl(lot.image),
        sku: lotDisplayCode(lot.id),
        brand: lot.brand ? { '@type': 'Brand', name: lot.brand } : undefined,
        offers: {
          '@type': 'Offer',
          price: lot.currentBid,
          priceCurrency: 'USD',
          availability: lot.status === 'live' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          url: absoluteUrl(pathname),
        },
      })
    } else if (isBids) {
      title = 'Bids & Auctions | VSK Global'
      description =
        'Track active, won, and lost bids on VSK Global. Manage manual and automatic bidding, settlements, and auction activity.'
    }

    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    if (image) {
      const abs = absoluteUrl(image)
      upsertMeta('property', 'og:image', abs)
    }
    upsertCanonical(absoluteUrl(pathname))
    upsertJsonLd(jsonLd)

    return () => {
      document.title = DEFAULT_TITLE
      upsertMeta('name', 'description', DEFAULT_DESCRIPTION)
      upsertMeta('property', 'og:title', DEFAULT_TITLE)
      upsertMeta('property', 'og:description', DEFAULT_DESCRIPTION)
      upsertMeta('name', 'twitter:title', DEFAULT_TITLE)
      upsertMeta('name', 'twitter:description', DEFAULT_DESCRIPTION)
      upsertJsonLd(null)
    }
  }, [lot, isBids, pathname])

  return null
}
