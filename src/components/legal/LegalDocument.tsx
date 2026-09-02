import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { icons } from '@/assets'
import { Icon } from '@/components/shared/Icon'
import { cn } from '@/utils/format'

export type LegalCalloutTone = 'blue' | 'amber'

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'sub'; title: string; items: string[] }
  | { type: 'callout'; text: string; tone: LegalCalloutTone }
  | { type: 'contact'; rows: { label: string; value: string; href?: string }[] }

export type LegalSection = {
  id: string
  title: string
  blocks: LegalBlock[]
}

export type LegalBreadcrumb = {
  label: string
  to?: string
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex w-full list-none flex-col gap-1.5 p-0">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="flex h-5 w-1 shrink-0 items-center justify-center" aria-hidden>
            <span className="size-1 rounded-full bg-slate-600" />
          </span>
          <span className="min-w-0 flex-1 text-[13.5px] leading-normal text-slate-600">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Callout({ text, tone }: { text: string; tone: LegalCalloutTone }) {
  return (
    <div
      className={cn(
        'w-full rounded-lg border px-3.5 py-3',
        tone === 'blue' && 'border-blue-200 bg-blue-50',
        tone === 'amber' && 'border-amber-200 bg-amber-50',
      )}
    >
      <p
        className={cn(
          'text-[12.5px] font-medium leading-normal',
          tone === 'blue' && 'text-blue-700',
          tone === 'amber' && 'text-amber-700',
        )}
      >
        {text}
      </p>
    </div>
  )
}

function ContactRows({ rows }: { rows: { label: string; value: string; href?: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-2 text-[13px] leading-normal">
          <span className="w-[90px] shrink-0 font-medium text-slate-700">{row.label}</span>
          {row.href ? (
            <a href={row.href} className="text-maroon-600">
              {row.value}
            </a>
          ) : (
            <span className="text-maroon-600">{row.value}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function renderBlock(block: LegalBlock, key: string): ReactNode {
  if (block.type === 'p') {
    return (
      <p key={key} className="text-[13.5px] leading-normal text-slate-600">
        {block.text}
      </p>
    )
  }
  if (block.type === 'ul') {
    return <BulletList key={key} items={block.items} />
  }
  if (block.type === 'sub') {
    return (
      <div key={key} className="flex w-full flex-col gap-1.5">
        <h3 className="text-[14px] font-semibold leading-normal text-slate-800">{block.title}</h3>
        <BulletList items={block.items} />
      </div>
    )
  }
  if (block.type === 'callout') {
    return <Callout key={key} text={block.text} tone={block.tone} />
  }
  return <ContactRows key={key} rows={block.rows} />
}

export function LegalDocument({
  title,
  lastUpdated,
  intro,
  breadcrumb,
  sections,
}: {
  title: string
  lastUpdated: string
  intro: string
  breadcrumb?: LegalBreadcrumb[]
  sections: LegalSection[]
}) {
  const ids = useMemo(() => sections.map((section) => section.id), [sections])
  const [activeId, setActiveId] = useState(ids[0] ?? '')

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace('#', ''))
    const startId = ids.includes(hash) ? hash : (ids[0] ?? '')
    setActiveId(startId)

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!elements.length) return

    if (ids.includes(hash)) {
      document.getElementById(hash)?.scrollIntoView()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const nextId = visible[0]?.target.id
        if (nextId) setActiveId(nextId)
      },
      { rootMargin: '-12% 0px -72% 0px', threshold: [0, 0.2, 1] },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return (
    <div className="flex w-full max-w-[1040px] flex-col gap-8">
      <header className="flex flex-col gap-2.5">
        {breadcrumb?.length ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] leading-normal">
            {breadcrumb.map((crumb, index) => {
              const isLast = index === breadcrumb.length - 1
              return (
                <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 ? <span className="text-slate-300">/</span> : null}
                  {crumb.to && !isLast ? (
                    <Link to={crumb.to} className="text-slate-400 hover:text-slate-600">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'font-medium text-slate-600' : 'text-slate-400'}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              )
            })}
          </nav>
        ) : null}
        <h1 className="text-[28px] font-bold leading-normal text-slate-900 sm:text-[32px]">{title}</h1>
        <p className="text-[12.5px] leading-normal text-slate-400">{lastUpdated}</p>
        <p className="text-[14px] leading-normal text-slate-600">{intro}</p>
      </header>

      <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
        <aside className="flex w-full shrink-0 flex-col gap-1 rounded-xl border border-slate-200 bg-white p-[18px] lg:sticky lg:top-6 lg:w-[260px]">
          <p className="text-[10.5px] font-semibold leading-normal text-slate-400">ON THIS PAGE</p>
          <div className="h-1.5 w-px" aria-hidden />
          <nav className="flex flex-col gap-1" aria-label="On this page">
            {sections.map((section) => {
              const isActive = section.id === activeId
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={() => setActiveId(section.id)}
                  className={cn(
                    'block w-full rounded-md px-2 py-[7px] text-left text-[12px] leading-normal text-slate-600 hover:bg-maroon-50 hover:text-wine-500',
                    isActive && 'bg-maroon-50 font-medium text-wine-500',
                  )}
                >
                  {section.title}
                </a>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 w-full max-w-[740px] flex-col gap-9">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-6">
              <div className="flex flex-col gap-3">
                <h2 className="text-[20px] font-semibold leading-normal text-slate-900">
                  {index + 1}. {section.title}
                </h2>
                {section.blocks.map((block, blockIndex) => renderBlock(block, `${section.id}-${blockIndex}`))}
              </div>
            </section>
          ))}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[12.5px] font-medium leading-normal text-maroon-600 hover:bg-slate-50"
            >
              <Icon src={icons.arrowUp} size={14} />
              Back to top
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
