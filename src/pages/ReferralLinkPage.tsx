import { Navigate, useParams } from 'react-router-dom'
import { normalizeReferralCode, referralSignupPath } from '@/utils/referral'

/** `/ref/:code` opens registration with that code filled and locked. */
export function ReferralLinkPage() {
  const { code } = useParams()
  const normalized = normalizeReferralCode(code)
  if (!normalized) return <Navigate to="/signup" replace />
  return <Navigate to={referralSignupPath(normalized)} replace />
}
