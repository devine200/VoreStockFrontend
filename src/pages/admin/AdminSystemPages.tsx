import { useParams } from 'react-router-dom'
import {
  AdminUsersList,
  AdminUserDetail,
} from '@/components/admin/users/UserScreens'
import { SyncDashboard, SyncDetailGate } from '@/components/admin/sync/SyncScreens'
import { TiersConfiguration } from '@/components/admin/tiers/TierScreens'
import { FeesConfig } from '@/components/admin/fees/FeeScreens'
import { AuditDetail, AuditList } from '@/components/admin/audit/AuditScreens'
import {
  ReferralConfig,
  ReferralDetailGate,
  ReferralsList,
  RewardsQueue,
} from '@/components/admin/referrals/ReferralScreens'

export function AdminReferralsPage() {
  return <ReferralsList />
}

export function AdminRewardsQueuePage() {
  return <RewardsQueue />
}

export function AdminReferralConfigPage() {
  return <ReferralConfig />
}

export function AdminReferralDetailPage() {
  return <ReferralDetailGate />
}

export function AdminFeesPage() {
  return <FeesConfig />
}

export function AdminTiersPage() {
  return <TiersConfiguration />
}

export function AdminSyncPage() {
  return <SyncDashboard />
}

export function AdminSyncDetailPage() {
  return <SyncDetailGate />
}

export function AdminAuditPage() {
  return <AuditList />
}

export function AdminAuditDetailPage() {
  return <AuditDetail />
}

export function AdminUsersPage() {
  return <AdminUsersList />
}

export function AdminUserFormPage() {
  // Create uses list + modal; edit uses detail + modal (Figma overlay flows).
  const { id } = useParams()
  if (!id) return <AdminUsersList openCreate />
  return <AdminUserDetail openEdit />
}

export function AdminUserDetailPage() {
  return <AdminUserDetail />
}
