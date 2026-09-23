import type { AdminAnalyticsTab } from '@/types/admin'

const GREEN = '#059669'
const GREEN_DEEP = '#047857'
const AMBER = '#f59e0b'
const RED = '#ef4444'
const SLATE = '#94a3b8'
const MAROON = '#531424'

const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'] as const
const w = (values: number[]) => weeks.map((label, i) => ({ label, value: values[i] }))

export const ADMIN_ANALYTICS: AdminAnalyticsTab[] = [
  {
    id: 'growth',
    label: 'Growth',
    subtitle: 'Buyer growth, KYC progress, tier progression, and referral performance.',
    filters: 'range+tier',
    kpis: [
      { label: 'New buyers (30d)', value: '186', hint: '+18% vs prior 30d' },
      { label: 'KYC pass rate', value: '91%', hint: 'of submitted reviews' },
      { label: 'Tier upgrades', value: '12', hint: 'last 30 days' },
      { label: 'Referral signups', value: '42', hint: 'last 30 days' },
    ],
    blocks: [
      {
        type: 'split',
        left: { kind: 'line', title: 'Buyer growth — last 8 weeks', points: w([42, 48, 45, 55, 58, 52, 61, 66]) },
        right: {
          kind: 'donut',
          title: 'KYC status distribution',
          slices: [
            { label: 'Approved', value: 82, color: GREEN },
            { label: 'Pending', value: 12, color: AMBER },
            { label: 'Rejected', value: 4, color: RED },
            { label: 'Resubmission', value: 3, color: SLATE },
          ],
        },
      },
      {
        type: 'split',
        left: {
          kind: 'bar',
          title: 'Buyers by tier',
          points: [
            { label: 'Tier 1', value: 620 },
            { label: 'Tier 2', value: 290 },
            { label: 'Tier 3', value: 98 },
          ],
        },
        right: {
          kind: 'funnel',
          title: 'Referral funnel',
          funnel: [
            { stage: 'Signups', count: 42, conversion: '100%' },
            { stage: 'Qualified', count: 31, conversion: '74%' },
            { stage: 'Rewarded', count: 26, conversion: '62%' },
          ],
        },
      },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    subtitle: "Live auction activity, what's selling, and B-Stock sync health.",
    filters: 'range',
    kpis: [
      { label: 'Live auctions', value: '156', hint: 'right now' },
      { label: 'Sell-through rate', value: '74%', hint: 'last 30 days' },
      { label: 'B-Stock sync', value: 'Healthy', hint: 'last synced 2m ago' },
      { label: 'Avg lot value', value: '$1,340', hint: 'last 30 days' },
    ],
    blocks: [
      {
        type: 'split',
        left: { kind: 'line', title: 'Live auctions — last 8 weeks', points: w([118, 128, 124, 136, 142, 138, 148, 156]) },
        right: {
          kind: 'bar',
          title: "What's selling — by category",
          points: [
            { label: 'Phones', value: 72 },
            { label: 'Laptops', value: 54 },
            { label: 'TVs', value: 44 },
            { label: 'Consoles', value: 25 },
          ],
        },
      },
      {
        type: 'full',
        panel: {
          kind: 'table',
          table: {
            title: 'B-Stock sync health',
            subtitle: 'Upstream catalog feeds the marketplace depends on.',
            headers: ['SOURCE', 'LAST SYNC', 'STATUS'],
            grid: '1.4fr 1fr 0.8fr',
            rows: [
              { cells: ['B-Stock catalog sync', '2 min ago', 'Healthy'], badgeAt: [2] },
              { cells: ['B-Stock pricing feed', '5 min ago', 'Healthy'], badgeAt: [2] },
              { cells: ['B-Stock inventory feed', '18 min ago', 'Delayed'], badgeAt: [2] },
            ],
          },
        },
      },
      {
        type: 'full',
        panel: {
          kind: 'table',
          table: {
            title: 'Top performing lots',
            subtitle: 'Highest sell-through lots in the last 30 days.',
            headers: ['LOT', 'CATEGORY', 'BIDS', 'SELL PRICE', 'SELL-THROUGH'],
            grid: '1.4fr 0.8fr 0.5fr 0.7fr 0.8fr',
            rows: [
              { cells: ['iPhone pallet #8821', 'Phones', '18', '$1,840', '96%'], successAt: [4] },
              { cells: ['Laptop lot #7733', 'Laptops', '14', '$1,640', '89%'], successAt: [4] },
              { cells: ['Smart TV pallet #5510', 'TVs', '11', '$1,220', '82%'], successAt: [4] },
            ],
          },
        },
      },
    ],
  },
  {
    id: 'bidding',
    label: 'Bidding',
    subtitle: 'Bidding activity, outbid behavior, and T-30 lock frequency.',
    filters: 'range',
    kpis: [
      { label: 'Bids (30d)', value: '2,840', hint: 'across all live auctions' },
      { label: 'Outbid rate', value: '38%', hint: 'of bids placed' },
      { label: 'T-30 locks', value: '64', hint: 'last 30 days' },
      { label: 'Avg bids / lot', value: '6.2', hint: 'last 30 days' },
    ],
    blocks: [
      {
        type: 'split',
        left: { kind: 'line', title: 'Bidding activity — last 8 weeks', points: w([420, 560, 490, 680, 720, 620, 760, 800]) },
        right: {
          kind: 'donut',
          title: 'Bid outcome breakdown',
          slices: [
            { label: 'Leading', value: 42, color: GREEN },
            { label: 'Outbid', value: 38, color: AMBER },
            { label: 'Won', value: 12, color: MAROON },
            { label: 'Expired', value: 8, color: SLATE },
          ],
        },
      },
      {
        type: 'full',
        panel: {
          kind: 'bar',
          title: 'T-30 lock frequency — last 8 weeks',
          caption: 'Number of times a bid triggered the last-30-second auction extension.',
          points: w([6, 9, 7, 11, 8, 10, 6, 7]),
          full: true,
        },
      },
      {
        type: 'full',
        panel: {
          kind: 'table',
          table: {
            title: 'Busiest lots',
            subtitle: 'Lots with the most bidding activity in the last 30 days.',
            headers: ['LOT', 'BIDS', 'LEADING BIDDER', 'STATUS'],
            grid: '1.4fr 0.6fr 1fr 0.8fr',
            rows: [
              { cells: ['iPhone pallet #8821', '18', 'Ada Okonkwo', 'Leading'], badgeAt: [3] },
              { cells: ['Laptop lot #7733', '14', 'Chidi Madueke', 'Leading'], badgeAt: [3] },
              { cells: ['Gaming console lot #3312', '9', 'Bola Shittu', 'Ending soon'], badgeAt: [3] },
            ],
          },
        },
      },
    ],
  },
  {
    id: 'money',
    label: 'Money',
    subtitle: 'Cash in, cash out, holds, fees, and refunds.',
    filters: 'range+tier',
    kpis: [
      { label: 'Cash in (30d)', value: '$75,600', hint: 'deposits credited' },
      { label: 'Cash out (30d)', value: '$8,200', hint: 'withdrawals paid' },
      { label: 'Holds active', value: '$5,100', hint: 'as of today' },
      { label: 'Refunds (30d)', value: '$1,240', hint: '3 refunds issued' },
    ],
    blocks: [
      {
        type: 'full',
        panel: {
          kind: 'dual-line',
          title: 'Deposits vs withdrawals',
          caption: 'Cash movement over the last 4 days.',
          legend: ['Deposits', 'Withdrawals'],
          yFormat: 'money',
          bColor: AMBER,
          points: [
            { label: 'Aug 8', a: 15200, b: 2400 },
            { label: 'Aug 9', a: 19800, b: 1900 },
            { label: 'Aug 10', a: 18200, b: 2100 },
            { label: 'Aug 11', a: 22400, b: 1800 },
          ],
        },
      },
      {
        type: 'full',
        panel: {
          kind: 'table',
          table: {
            headers: ['DATE', 'DEPOSITS', 'WITHDRAWALS PAID', 'HOLDS ACTIVE', 'FORFEITED'],
            grid: '0.8fr 1fr 1.2fr 1fr 0.8fr',
            rows: [
              { cells: ['Aug 8', '$15,200', '$2,400', '$3,900', '$0'] },
              { cells: ['Aug 9', '$19,800', '$1,900', '$4,200', '$120'], dangerAt: [4] },
              { cells: ['Aug 10', '$18,200', '$2,100', '$4,500', '$200'], dangerAt: [4] },
              { cells: ['Aug 11', '$22,400', '$1,800', '$5,100', '$0'] },
            ],
          },
        },
      },
      {
        type: 'full',
        panel: {
          kind: 'fees',
          title: 'Fee revenue by type',
          subtitle: 'Platform fee revenue collected in the last 30 days.',
          compact: true,
          items: [
            { label: 'Service fee', value: '$12000', amount: 12000 },
            { label: 'Processing fee', value: '$4000', amount: 4000 },
            { label: 'Freight markup', value: '$2000', amount: 2000 },
          ],
        },
      },
    ],
  },
  {
    id: 'settlement',
    label: 'Settlement',
    subtitle: 'Are winners paying within the 12-hour window, and how many default.',
    filters: 'range',
    kpis: [
      { label: 'On-time payment', value: '88%', hint: 'within 12h window' },
      { label: 'Defaults (30d)', value: '9', hint: 'missed 12h window' },
      { label: 'Avg time to pay', value: '4h 20m', hint: 'from win to payment' },
      { label: 'Holds forfeited', value: '$1,840', hint: 'last 30 days' },
    ],
    blocks: [
      {
        type: 'split',
        left: {
          kind: 'bar',
          title: 'Time to pay distribution',
          caption: 'Winners must pay within 12 hours of winning. The dashed line marks the cutoff.',
          points: [
            { label: '0–4h', value: 142 },
            { label: '4–8h', value: 68 },
            { label: '8–12h', value: 24 },
            { label: 'Overdue', value: 9 },
          ],
          cutoffAt: 'Overdue',
          colors: [GREEN, GREEN_DEEP, AMBER, RED],
        },
        right: {
          kind: 'donut',
          title: 'Settlement outcome',
          slices: [
            { label: 'Paid on time', value: 88, color: GREEN },
            { label: 'Defaulted', value: 12, color: RED },
          ],
        },
      },
      {
        type: 'full',
        panel: {
          kind: 'table',
          table: {
            title: 'Recent settlements',
            subtitle: 'Payment activity against the 12-hour window.',
            headers: ['BUYER', 'LOT', 'AMOUNT', 'TIME TO PAY', 'STATUS'],
            grid: '1fr 1.3fr 0.7fr 0.8fr 0.7fr',
            rows: [
              { cells: ['Ada Okonkwo', 'iPhone pallet #8821', '$1,840', '2h 14m', 'Paid'], badgeAt: [4] },
              { cells: ['Emeka Terver', 'Laptop lot #7733', '$890', '9h 02m', 'Paid'], badgeAt: [4] },
              { cells: ['Bola Shittu', 'Gaming console lot #3312', '$410', '14h 40m', 'Default'], badgeAt: [4], dangerAt: [3] },
            ],
          },
        },
      },
    ],
  },
  {
    id: 'procurement',
    label: 'Procurement',
    subtitle: 'After BidBridge wins, are ops successfully placing on B-Stock?',
    filters: 'range',
    kpis: [
      { label: 'Placements attempted', value: '214', hint: 'last 30 days' },
      { label: 'Successful placements', value: '198', hint: 'confirmed on B-Stock' },
      { label: 'Failed placements', value: '16', hint: 'last 30 days' },
      { label: 'Success rate', value: '92%', hint: 'last 30 days' },
    ],
    blocks: [
      {
        type: 'split',
        left: { kind: 'line', title: 'Placements — last 8 weeks', points: w([18, 24, 21, 29, 26, 34, 28, 26]) },
        right: {
          kind: 'donut',
          title: 'Placement outcomes',
          slices: [
            { label: 'Successful', value: 93, color: GREEN },
            { label: 'Failed', value: 7, color: RED },
          ],
        },
      },
      {
        type: 'full',
        panel: {
          kind: 'table',
          table: {
            title: 'Placement failure reasons',
            subtitle: 'Why an attempted B-Stock placement did not succeed.',
            headers: ['REASON', 'COUNT', 'SHARE OF FAILURES'],
            grid: '2fr 0.6fr 0.9fr',
            rows: [
              { cells: ['T-30 window missed before ops could place', '7', '44%'] },
              { cells: ['Buyer max exceeded upstream B-Stock price', '5', '31%'] },
              { cells: ['B-Stock listing closed before placement', '4', '25%'] },
            ],
          },
        },
      },
    ],
  },
  {
    id: 'logistics',
    label: 'Logistics',
    subtitle: 'Where orders are stuck, Aquantuo batches, customs, and delivery times.',
    filters: 'range',
    kpis: [
      { label: 'Orders in transit', value: '142', hint: 'Paid → Delivered' },
      { label: 'Orders stuck', value: '18', hint: '>3 days at one stage' },
      { label: 'Avg delivery time', value: '9.4 days', hint: 'win to delivered' },
      { label: 'Avg customs time', value: '2.1 days', hint: 'customs clearance' },
    ],
    blocks: [
      {
        type: 'full',
        panel: {
          kind: 'bar',
          title: 'Orders by logistics stage',
          caption: 'Where orders currently sit. Stages with elevated counts may indicate a bottleneck.',
          points: [
            { label: 'Paid', value: 24 },
            { label: 'Lot Secured', value: 19 },
            { label: 'US 3PL Verified', value: 31 },
            { label: 'Shipped', value: 28 },
            { label: 'Customs', value: 22 },
            { label: 'Delivered', value: 18 },
          ],
          full: true,
          wrapTicks: true,
          colors: [MAROON, MAROON, AMBER, MAROON, AMBER, MAROON],
        },
      },
      {
        type: 'split',
        left: {
          kind: 'line',
          title: 'Avg delivery time — last 8 weeks',
          points: w([11.2, 10.4, 10.1, 9.8, 10.0, 9.5, 9.7, 9.6]),
          yFormat: 'days',
        },
        right: {
          kind: 'table',
          table: {
            title: 'Aquantuo batch status',
            headers: ['BATCH', 'ORDERS', 'VERIFIED', 'STATUS'],
            grid: '1fr 0.7fr 0.7fr 1fr',
            rows: [
              { cells: ['AQ-B-0912', '14', '14', 'Complete'], badgeAt: [3] },
              { cells: ['AQ-B-0913', '11', '7', 'In progress'], badgeAt: [3] },
              { cells: ['AQ-B-0914', '9', '2', 'Delayed'], badgeAt: [3] },
            ],
          },
        },
      },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    subtitle: 'Ticket volume, response times, and SLA breach performance.',
    filters: 'range',
    kpis: [
      { label: 'Tickets created (30d)', value: '186', hint: 'across all queues' },
      { label: 'Avg first response', value: '38m', hint: 'last 30 days' },
      { label: 'SLA breach rate', value: '6%', hint: 'of tickets closed' },
      { label: 'Open tickets', value: '24', hint: 'right now' },
    ],
    blocks: [
      {
        type: 'split',
        left: { kind: 'line', title: 'Ticket volume — last 8 weeks', points: w([32, 42, 38, 48, 56, 40, 46, 58]) },
        right: {
          kind: 'donut',
          title: 'SLA status',
          slices: [
            { label: 'Within SLA', value: 82, color: GREEN },
            { label: 'At risk', value: 12, color: AMBER },
            { label: 'Breached', value: 6, color: RED },
          ],
        },
      },
      {
        type: 'full',
        panel: {
          kind: 'table',
          table: {
            title: 'Tickets by category',
            subtitle: 'Volume and resolution speed by ticket type.',
            headers: ['CATEGORY', 'TICKETS', 'AVG RESOLUTION', 'SLA BREACH RATE'],
            grid: '1.4fr 0.7fr 1fr 1fr',
            rows: [
              { cells: ['KYC documents', '52', '4h 10m', '3%'] },
              { cells: ['Settlement window', '38', '2h 40m', '9%'] },
              { cells: ['Withdrawal', '34', '6h 20m', '5%'] },
              { cells: ['Shipping / delivery', '41', '1d 2h', '8%'] },
              { cells: ['Account access', '21', '1h 15m', '2%'] },
            ],
          },
        },
      },
    ],
  },
  {
    id: 'revenue',
    label: 'Revenue',
    subtitle: 'Platform revenue and where it comes from.',
    filters: 'revenue',
    kpiCount: 5,
    chrome: 'flush',
    kpis: [
      { label: 'Total Revenue (30d)', value: '$129,400', hint: '↑ +12.4% vs prior 30d', hintTone: 'success' },
      { label: 'Platform Fees', value: '$54,200', hint: '↑ +9.1% vs prior 30d', hintTone: 'success' },
      { label: 'Processing Fees', value: '$18,900', hint: '↑ +4.7% vs prior 30d', hintTone: 'success' },
      { label: 'B-Stock Markup Revenue', value: '$41,600', hint: '↑ +15.8% vs prior 30d', hintTone: 'success' },
      { label: 'Freight Revenue', value: '$13,700', hint: '↓ -2.3% vs prior 30d', hintTone: 'danger' },
    ],
    blocks: [
      {
        type: 'full',
        panel: {
          kind: 'dual-line',
          title: 'Revenue trend',
          caption: 'Revenue over time, compared to the previous period.',
          legend: ['Current period', 'Previous period (dashed)'],
          yFormat: 'money',
          dashedB: true,
          filledDots: true,
          points: [
            { label: 'Aug 18', a: 3200, b: 2800 },
            { label: 'Aug 19', a: 3700, b: 3000 },
            { label: 'Aug 20', a: 3400, b: 3100 },
            { label: 'Aug 21', a: 4100, b: 3300 },
            { label: 'Aug 22', a: 4700, b: 3600 },
            { label: 'Aug 23', a: 4300, b: 3500 },
            { label: 'Aug 24', a: 5200, b: 3800 },
            { label: 'Aug 25', a: 5700, b: 4000 },
          ],
        },
      },
      {
        type: 'full',
        panel: {
          kind: 'fees',
          title: 'Revenue breakdown',
          subtitle: 'Where platform revenue comes from.',
          items: [
            { label: 'Buyer Service Fees', value: '$54200', amount: 54200 },
            { label: 'Processing Fees', value: '$18900', amount: 18900 },
            { label: 'B-Stock Markup', value: '$41600', amount: 41600 },
            { label: 'Freight / Logistics Revenue', value: '$13700', amount: 13700 },
            { label: 'Other', value: '$1000', amount: 1000 },
          ],
        },
      },
      {
        type: 'full',
        panel: {
          kind: 'table',
          table: {
            title: 'Revenue by source',
            subtitle: 'Gross, refunds, and net revenue for each source.',
            headers: ['REVENUE SOURCE', 'TRANSACTIONS', 'GROSS REVENUE', 'REFUNDS', 'NET REVENUE', '% OF TOTAL', ''],
            grid: '1.3fr 0.9fr 1fr 0.8fr 1fr 0.8fr 0.5fr',
            rows: [
              { cells: ['Buyer Service Fees', '1,842', '$55,100', '-$900', '$54,200', '41.9%', 'View'], viewKey: 'Buyer Service Fees', dangerAt: [3] },
              { cells: ['Processing Fees', '1,842', '$19,400', '-$500', '$18,900', '14.6%', 'View'], viewKey: 'Processing Fees', dangerAt: [3] },
              { cells: ['B-Stock Markup', '612', '$42,300', '-$700', '$41,600', '32.1%', 'View'], viewKey: 'B-Stock Markup', dangerAt: [3] },
              { cells: ['Freight / Logistics Revenue', '598', '$14,100', '-$400', '$13,700', '10.6%', 'View'], viewKey: 'Freight / Logistics Revenue', dangerAt: [3] },
              { cells: ['Other', '34', '$1,100', '-$100', '$1,000', '0.8%', 'View'], viewKey: 'Other', dangerAt: [3] },
            ],
          },
        },
      },
      {
        type: 'full',
        panel: {
          kind: 'stats',
          title: 'Revenue performance',
          subtitle: 'Gross revenue clearly distinguished from net revenue.',
          items: [
            { label: 'Gross Revenue', value: '$132,000' },
            { label: 'Refunds', value: '-$2,600', tone: 'danger' },
            { label: 'Net Revenue', value: '$129,400', tone: 'success' },
            { label: 'Average Revenue per Order', value: '$70.25' },
            { label: 'Average Revenue per Buyer', value: '$202.19' },
            { label: 'Total Revenue-Generating Orders', value: '1,842' },
          ],
        },
      },
      {
        type: 'full',
        panel: {
          kind: 'table',
          table: {
            title: 'Top revenue periods',
            subtitle: 'Highest-performing periods by net revenue.',
            headers: ['DATE / PERIOD', 'ORDERS', 'GROSS REVENUE', 'NET REVENUE'],
            grid: '1.2fr 0.8fr 1fr 1fr',
            rows: [
              { cells: ['Aug 24, 2026', '210', '$9,800', '$9,600'] },
              { cells: ['Aug 22, 2026', '198', '$9,200', '$9,000'] },
              { cells: ['Aug 19, 2026', '185', '$8,700', '$8,500'] },
              { cells: ['Aug 25, 2026', '178', '$8,300', '$8,100'] },
              { cells: ['Aug 21, 2026', '165', '$7,900', '$7,700'] },
            ],
          },
        },
      },
    ],
  },
]
