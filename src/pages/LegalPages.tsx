import { LegalDocument, type LegalSection } from '@/components/legal/LegalDocument'

function lastUpdatedLabel() {
  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())
  return `Last Updated: ${formatted}`
}

const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'eligibility',
    title: 'Eligibility',
    blocks: [
      {
        type: 'p',
        text: 'You must provide accurate information when creating an account and must meet any applicable eligibility requirements to use BidBridge.',
      },
      {
        type: 'p',
        text: 'We may require identity or business verification before allowing access to certain features.',
      },
    ],
  },
  {
    id: 'your-account',
    title: 'Your Account',
    blocks: [
      { type: 'p', text: 'You are responsible for:' },
      {
        type: 'ul',
        items: [
          'Providing accurate account information',
          'Keeping your login credentials secure',
          'Maintaining the security of your account',
          'Not allowing unauthorized persons to use your account',
        ],
      },
      {
        type: 'p',
        text: 'You must notify BidBridge if you believe your account has been compromised.',
      },
    ],
  },
  {
    id: 'kyc-verification',
    title: 'KYC and Verification',
    blocks: [
      {
        type: 'p',
        text: 'Certain BidBridge features may require identity or business verification.',
      },
      {
        type: 'p',
        text: 'You agree to provide accurate and valid information and documents when requested.',
      },
      {
        type: 'p',
        text: 'BidBridge may restrict certain account functions where required verification has not been completed.',
      },
    ],
  },
  {
    id: 'auctions-bidding',
    title: 'Auctions and Bidding',
    blocks: [
      {
        type: 'p',
        text: 'BidBridge provides access to auction and marketplace opportunities.',
      },
      {
        type: 'p',
        text: 'Before placing a bid, you should review the applicable lot information, including available descriptions, condition information, pricing, and other relevant details.',
      },
      { type: 'p', text: 'A bid may create a financial commitment.' },
      {
        type: 'p',
        text: 'Once a bid is submitted, you may not be able to cancel or withdraw it except where permitted by BidBridge or applicable law.',
      },
    ],
  },
  {
    id: 'bid-holds',
    title: 'Bid Holds',
    blocks: [
      {
        type: 'p',
        text: 'BidBridge may place a temporary hold on a portion of your available balance when you place a bid.',
      },
      {
        type: 'callout',
        tone: 'blue',
        text: 'The applicable bid hold may be 10%–15% of the bid amount, depending on the applicable platform rules.',
      },
      {
        type: 'p',
        text: 'The hold may be released, applied toward settlement, or otherwise handled according to the outcome of the auction and applicable platform rules.',
      },
    ],
  },
  {
    id: 'winning-auction',
    title: 'Winning an Auction',
    blocks: [
      {
        type: 'p',
        text: 'If you win an auction, you are responsible for completing the required settlement payment within the applicable settlement period.',
      },
      {
        type: 'callout',
        tone: 'blue',
        text: 'The platform currently provides for a 12-hour settlement window for winning buyers.',
      },
      {
        type: 'p',
        text: 'Failure to complete payment within the required period may result in consequences including cancellation, forfeiture, or other actions permitted under the applicable platform rules.',
      },
    ],
  },
  {
    id: 'proxy-placement',
    title: 'Proxy Placement',
    blocks: [
      {
        type: 'p',
        text: 'After a qualifying BidBridge auction win and payment, BidBridge may place the corresponding upstream bid on the relevant marketplace.',
      },
      {
        type: 'p',
        text: "Where applicable, BidBridge may use the buyer's maximum bid and the platform's permitted Overdrive mechanism.",
      },
      { type: 'p', text: 'The outcome may include:' },
      {
        type: 'ul',
        items: ['Lot secured', 'Outbid upstream', 'Failed placement'],
      },
      {
        type: 'p',
        text: "Where a placement fails or the buyer is outbid upstream, applicable refunds will be handled according to the platform's refund rules.",
      },
    ],
  },
  {
    id: 'pricing-fees',
    title: 'Pricing and Fees',
    blocks: [
      { type: 'p', text: 'Your purchase may include applicable:' },
      {
        type: 'ul',
        items: [
          'Product or lot price',
          'BidBridge service fees',
          'Processing fees',
          'Marketplace-related fees',
          'Freight or logistics charges',
          'Other applicable charges displayed before or during checkout',
        ],
      },
      {
        type: 'p',
        text: 'Applicable fees will be shown through the platform where reasonably possible.',
      },
    ],
  },
  {
    id: 'orders',
    title: 'Orders',
    blocks: [
      {
        type: 'p',
        text: 'After winning and completing the required payment process, your order may progress through stages including:',
      },
      {
        type: 'p',
        text: 'Won → Paid → Lot Secured → US 3PL Verified → Shipped → Customs → Delivered',
      },
      {
        type: 'p',
        text: 'The exact timeline may vary depending on the auction, seller, warehouse, shipping provider, customs authorities, and other third parties.',
      },
    ],
  },
  {
    id: 'product-condition',
    title: 'Product Condition',
    blocks: [
      {
        type: 'p',
        text: 'Marketplace lots may contain new, used, refurbished, returned, damaged, or otherwise varying-condition products.',
      },
      {
        type: 'p',
        text: 'You are responsible for reviewing the information available for a lot before bidding.',
      },
      {
        type: 'p',
        text: 'Unless expressly stated otherwise, BidBridge does not guarantee that a product will meet your personal expectations beyond the information and guarantees expressly provided for that listing.',
      },
    ],
  },
  {
    id: 'shipping-logistics',
    title: 'Shipping and Logistics',
    blocks: [
      {
        type: 'p',
        text: 'Shipping may involve third party logistics and warehouse providers.',
      },
      {
        type: 'p',
        text: 'Delivery dates are estimates unless expressly guaranteed.',
      },
      { type: 'p', text: 'Delays may occur because of:' },
      {
        type: 'ul',
        items: [
          'Warehouse processing',
          'Shipping availability',
          'Customs',
          'Carrier delays',
          'Documentation requirements',
          "Events outside BidBridge's reasonable control",
        ],
      },
    ],
  },
  {
    id: 'customs-import',
    title: 'Customs and Import Requirements',
    blocks: [
      {
        type: 'p',
        text: 'You may be responsible for applicable customs duties, taxes, import requirements, documentation, or other government charges associated with receiving goods in your destination country, where applicable.',
      },
    ],
  },
  {
    id: 'refunds',
    title: 'Refunds',
    blocks: [
      {
        type: 'p',
        text: 'Refund eligibility depends on the reason for the refund and the applicable transaction or platform rules.',
      },
      { type: 'p', text: 'Refunds may apply in situations such as:' },
      {
        type: 'ul',
        items: ['Failed upstream placement', 'Eligible cancellation', 'Applicable policy-based refund'],
      },
      {
        type: 'p',
        text: 'Refund processing times may vary depending on the payment method and financial service provider.',
      },
    ],
  },
  {
    id: 'withdrawals',
    title: 'Withdrawals',
    blocks: [
      {
        type: 'p',
        text: 'Users may request withdrawal of eligible wallet funds through the platform.',
      },
      { type: 'p', text: 'Withdrawal requests may be subject to:' },
      {
        type: 'ul',
        items: [
          'Account verification',
          'Compliance checks',
          'Available balance',
          'Applicable restrictions',
          'Administrative review',
        ],
      },
      {
        type: 'p',
        text: 'BidBridge may delay, reject, or restrict a withdrawal where reasonably necessary for security, fraud prevention, compliance, or other legitimate reasons.',
      },
    ],
  },
  {
    id: 'prohibited-activity',
    title: 'Prohibited Activity',
    blocks: [
      { type: 'p', text: 'You may not use BidBridge to:' },
      {
        type: 'ul',
        items: [
          'Provide false or misleading information',
          'Manipulate auctions or bids',
          'Engage in fraudulent transactions',
          'Circumvent platform restrictions',
          'Abuse refunds or withdrawals',
          "Use another person's account without authorization",
          'Interfere with platform security',
          'Engage in unlawful activity',
        ],
      },
    ],
  },
  {
    id: 'account-restrictions',
    title: 'Account Restrictions',
    blocks: [
      {
        type: 'p',
        text: 'BidBridge may restrict, suspend, or deactivate an account where necessary, including in cases involving:',
      },
      {
        type: 'ul',
        items: [
          'Fraud or suspected fraud',
          'Violation of these Terms',
          'Failed or incomplete verification',
          'Payment issues',
          'Abuse of the platform',
          'Security concerns',
          'Legal or regulatory requirements',
        ],
      },
    ],
  },
  {
    id: 'referrals-rewards',
    title: 'Referrals and Rewards',
    blocks: [
      {
        type: 'p',
        text: 'Where the referral program is available, rewards are subject to the applicable qualification requirements displayed by BidBridge.',
      },
      {
        type: 'p',
        text: 'Referral rewards may require the referred buyer to complete specified activities, such as verification and an eligible deposit or paid order.',
      },
      {
        type: 'p',
        text: 'BidBridge may reverse rewards associated with fraudulent, invalid, duplicated, or otherwise ineligible referrals.',
      },
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    blocks: [
      {
        type: 'p',
        text: 'The BidBridge platform, branding, content, software, designs, trademarks, and other materials are owned by or licensed to BidBridge and may not be copied, reproduced, modified, or distributed without authorization.',
      },
    ],
  },
  {
    id: 'third-party-services',
    title: 'Third Party Services',
    blocks: [
      {
        type: 'p',
        text: 'BidBridge may rely on third party marketplaces, payment providers, verification services, warehouses, shipping providers, and other service providers.',
      },
      {
        type: 'p',
        text: 'Third party services may have their own terms and policies.',
      },
    ],
  },
  {
    id: 'limitation-liability',
    title: 'Limitation of Liability',
    blocks: [
      {
        type: 'p',
        text: 'To the extent permitted by applicable law, BidBridge will not be responsible for losses arising from circumstances outside its reasonable control, including third party service interruptions, carrier delays, customs delays, marketplace changes, or other external events.',
      },
      {
        type: 'p',
        text: 'Nothing in these Terms excludes liability that cannot legally be excluded.',
      },
    ],
  },
  {
    id: 'changes-to-terms',
    title: 'Changes to These Terms',
    blocks: [
      { type: 'p', text: 'We may update these Terms from time to time.' },
      {
        type: 'p',
        text: 'Where appropriate, we will notify users of material changes. Continued use of the platform after the updated Terms become effective constitutes acceptance of the updated Terms to the extent permitted by law.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    blocks: [
      { type: 'p', text: 'For questions regarding these Terms:' },
      {
        type: 'contact',
        rows: [
          { label: 'Email:', value: '[support@bidbridge.africa]', href: 'mailto:support@bidbridge.africa' },
          { label: 'Company:', value: 'BidBridge Africa' },
          { label: 'Address:', value: '[Insert Company Address]' },
        ],
      },
    ],
  },
]

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'info-we-collect',
    title: 'Information We Collect',
    blocks: [
      {
        type: 'p',
        text: 'When you create an account or use BidBridge, we may collect:',
      },
      {
        type: 'sub',
        title: 'Account Information',
        items: ['Full name', 'Email address', 'Phone number', 'Account credentials', 'Profile information'],
      },
      {
        type: 'sub',
        title: 'Verification Information',
        items: [
          'Identification documents',
          'KYC/KYB information',
          'Information required to verify your identity or business',
        ],
      },
      {
        type: 'sub',
        title: 'Transaction Information',
        items: [
          'Deposits',
          'Bids',
          'Bid holds',
          'Purchases',
          'Settlements',
          'Fees',
          'Refunds',
          'Withdrawals',
        ],
      },
      {
        type: 'sub',
        title: 'Order & Logistics Information',
        items: [
          'Order details',
          'Lot information',
          'Shipping information',
          'Delivery information',
          'Tracking information',
        ],
      },
      {
        type: 'sub',
        title: 'Technical Information',
        items: [
          'IP address',
          'Device information',
          'Browser information',
          'Login activity',
          'Platform usage information',
        ],
      },
    ],
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Information',
    blocks: [
      { type: 'p', text: 'We may use your information to:' },
      {
        type: 'ul',
        items: [
          'Create and manage your account',
          'Verify your identity',
          'Process bids and purchases',
          'Process payments and withdrawals',
          'Manage bid holds and settlements',
          'Provide order and shipment tracking',
          'Communicate with you about your account and orders',
          'Provide customer support',
          'Detect fraud, abuse, and suspicious activity',
          'Maintain platform security',
          'Improve our products and services',
          'Meet legal and regulatory requirements',
        ],
      },
    ],
  },
  {
    id: 'bidding-marketplace',
    title: 'Bidding and Marketplace Information',
    blocks: [
      {
        type: 'p',
        text: 'Information relating to your bids, purchases, winning lots, and marketplace activity may be processed to operate the BidBridge marketplace.',
      },
      {
        type: 'p',
        text: 'Your information may also be shared with relevant service providers when necessary to complete a transaction, including payment, marketplace, verification, warehouse, shipping, and logistics services.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    blocks: [
      {
        type: 'p',
        text: 'BidBridge may work with third party payment and financial service providers to process deposits, payments, refunds, and withdrawals.',
      },
      {
        type: 'p',
        text: 'We do not necessarily store all payment information ourselves. Information may be processed directly by the relevant payment provider in accordance with its own privacy policy.',
      },
    ],
  },
  {
    id: 'verification',
    title: 'Verification',
    blocks: [
      {
        type: 'p',
        text: 'We may use third party verification services to verify your identity and, where applicable, product or order information.',
      },
      {
        type: 'p',
        text: 'You may be required to provide accurate and current information to complete verification.',
      },
    ],
  },
  {
    id: 'sharing-information',
    title: 'Sharing Your Information',
    blocks: [
      { type: 'p', text: 'We may share relevant information with:' },
      {
        type: 'ul',
        items: [
          'Payment providers',
          'Marketplace and auction partners',
          'Identity and verification providers',
          'Warehouse and 3PL providers',
          'Shipping and logistics providers',
          'Customer support providers',
          'Technology and infrastructure providers',
          'Legal, regulatory, or government authorities where required',
        ],
      },
      {
        type: 'p',
        text: 'We only share information where reasonably necessary for the relevant purpose.',
      },
    ],
  },
  {
    id: 'data-security',
    title: 'Data Security',
    blocks: [
      {
        type: 'p',
        text: 'We use reasonable technical and organizational safeguards designed to protect your information against unauthorized access, loss, misuse, alteration, or disclosure.',
      },
      {
        type: 'callout',
        tone: 'amber',
        text: 'No online service can guarantee absolute security.',
      },
    ],
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    blocks: [
      {
        type: 'p',
        text: 'We retain information for as long as reasonably necessary to provide our services, maintain transaction records, resolve disputes, prevent fraud, comply with legal obligations, and enforce our agreements.',
      },
    ],
  },
  {
    id: 'your-choices',
    title: 'Your Choices',
    blocks: [
      {
        type: 'p',
        text: 'Depending on applicable law, you may have rights regarding your personal information, including the ability to:',
      },
      {
        type: 'ul',
        items: [
          'Access your information',
          'Request correction of inaccurate information',
          'Request deletion where legally permitted',
          'Request information about how your data is used',
          'Withdraw certain permissions or consent',
        ],
      },
      {
        type: 'p',
        text: 'Some information may need to be retained to meet legal, financial, security, or regulatory obligations.',
      },
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies and Similar Technologies',
    blocks: [
      { type: 'p', text: 'BidBridge may use cookies and similar technologies to:' },
      {
        type: 'ul',
        items: [
          'Keep you signed in',
          'Remember preferences',
          'Improve platform performance',
          'Understand how users interact with the platform',
          'Maintain security',
        ],
      },
      {
        type: 'p',
        text: 'You may be able to control cookies through your browser or device settings.',
      },
    ],
  },
  {
    id: 'third-party-services',
    title: 'Third Party Services',
    blocks: [
      {
        type: 'p',
        text: 'BidBridge may contain integrations or links to third party services. Their handling of your information is governed by their own policies and terms.',
      },
    ],
  },
  {
    id: 'changes-to-policy',
    title: 'Changes to This Privacy Policy',
    blocks: [
      { type: 'p', text: 'We may update this Privacy Policy from time to time.' },
      {
        type: 'p',
        text: 'When we make material changes, we will update the effective date and, where appropriate, notify you through the platform or other available communication channels.',
      },
    ],
  },
  {
    id: 'contact-us',
    title: 'Contact Us',
    blocks: [
      {
        type: 'p',
        text: 'If you have questions about this Privacy Policy or your personal information, contact us at:',
      },
      {
        type: 'contact',
        rows: [
          { label: 'Email:', value: '[privacy@bidbridge.africa]', href: 'mailto:privacy@bidbridge.africa' },
          { label: 'Company:', value: 'BidBridge Africa' },
          { label: 'Address:', value: '[Insert Company Address]' },
        ],
      },
    ],
  },
]

export function TermsPage() {
  return (
    <LegalDocument
      title="Terms & Conditions"
      lastUpdated={lastUpdatedLabel()}
      intro="Welcome to BidBridge Africa. These Terms & Conditions (“Terms”) govern your access to and use of the BidBridge Africa platform, including auctions, bidding, purchases, payments, referrals, logistics, and related services. By creating an account or using BidBridge, you agree to these Terms."
      sections={TERMS_SECTIONS}
    />
  )
}

export function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated={lastUpdatedLabel()}
      intro="BidBridge Africa (“BidBridge,” “we,” “our,” or “us”) respects your privacy and is committed to protecting the personal information you provide when using our platform. This Privacy Policy explains what information we collect, how we use it, who we may share it with, and the choices available to you when you use BidBridge Africa."
      breadcrumb={[
        { label: 'Home', to: '/' },
        { label: 'Privacy Policy' },
      ]}
      sections={PRIVACY_SECTIONS}
    />
  )
}
