import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout, AuthLayout, RootError, RootLayout } from '@/layouts/AppLayout'
import { AdminLayout, AdminAuthLayout } from '@/layouts/AdminLayout'
import { AuthGuard, GuestGuard, AdminGuard, AdminGuestGuard } from '@/components/session/Guards'
import { HomePage } from '@/pages/HomePage'
import { CategoryPage } from '@/pages/CategoryPage'
import { LotDetailPage } from '@/pages/LotDetailPage'
import { LoginPage, SignupPage } from '@/pages/AuthPages'
import { ReferralLinkPage } from '@/pages/ReferralLinkPage'
import { BidsPage } from '@/pages/BidsPage'
import { WatchlistPage } from '@/pages/WatchlistPage'
import { WalletPage } from '@/pages/WalletPage'
import { OffersPage } from '@/pages/OffersPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { DisputesPage } from '@/pages/DisputesPage'
import { SupportPage } from '@/pages/SupportPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { ContractsPage } from '@/pages/ContractsPage'
import { PreferencesPage } from '@/pages/PreferencesPage'
import { VerificationPage } from '@/pages/VerificationPage'
import { ReferralsPage } from '@/pages/ReferralsPage'
import { PrivacyPage, TermsPage } from '@/pages/LegalPages'
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage'
import { AdminVerificationDetailPage, AdminVerificationPage } from '@/pages/admin/AdminVerificationPages'
import {
  AdminProxyDetailPage,
  AdminProxyPage,
  AdminSettlementDetailPage,
  AdminSettlementReconciliationPage,
  AdminSettlementsPage,
  AdminSupportQueuePage,
  AdminTicketDetailPage,
  AdminTplDetailPage,
  AdminTplPage,
  AdminWithdrawalDetailPage,
  AdminWithdrawalsPage,
} from '@/pages/admin/AdminQueuePages'
import {
  AdminBuyerDetailPage,
  AdminBuyersPage,
  AdminRegulationDetailPage,
  AdminRegulationPage,
} from '@/pages/admin/AdminPeoplePages'
import {
  AdminAuctionDetailPage,
  AdminAuctionsPage,
  AdminLotDetailPage,
  AdminLotsPage,
  AdminOrderDetailPage,
  AdminOrdersPage,
  AdminShipmentDetailPage,
  AdminShipmentsPage,
  AdminTransactionDetailPage,
  AdminTransactionsPage,
} from '@/pages/admin/AdminCommercePages'
import {
  AdminAuditDetailPage,
  AdminAuditPage,
  AdminFeesPage,
  AdminReferralConfigPage,
  AdminReferralDetailPage,
  AdminReferralsPage,
  AdminRewardsQueuePage,
  AdminSyncDetailPage,
  AdminSyncPage,
  AdminTiersPage,
  AdminUserDetailPage,
  AdminUserFormPage,
  AdminUsersPage,
} from '@/pages/admin/AdminSystemPages'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RootError />,
    children: [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'categories/:slug', element: <CategoryPage /> },
      { path: 'lots/:id', element: <LotDetailPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      {
        element: <AuthGuard />,
        children: [
          { path: 'bids', element: <BidsPage /> },
          { path: 'watchlist', element: <WatchlistPage /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'offers', element: <OffersPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'support', element: <SupportPage /> },
          { path: 'preferences', element: <PreferencesPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'verification', element: <VerificationPage /> },
          { path: 'referrals', element: <ReferralsPage /> },
          { path: 'disputes', element: <DisputesPage /> },
          { path: 'contracts', element: <ContractsPage /> },
        ],
      },
    ],
  },
  {
    path: 'admin',
    children: [
      {
        element: <AdminGuestGuard />,
        children: [
          {
            element: <AdminAuthLayout />,
            children: [{ path: 'login', element: <AdminLoginPage /> }],
          },
        ],
      },
      {
        element: <AdminGuard />,
        children: [
          {
            element: <AdminLayout />,
            children: [
          { index: true, element: <AdminOverviewPage /> },
          { path: 'analytics', element: <AdminAnalyticsPage /> },
          { path: 'verification', element: <AdminVerificationPage /> },
          { path: 'verification/:id', element: <AdminVerificationDetailPage /> },
          { path: 'settlements', element: <AdminSettlementsPage /> },
          { path: 'settlements/reconciliation', element: <AdminSettlementReconciliationPage /> },
          { path: 'settlements/:id', element: <AdminSettlementDetailPage /> },
          { path: 'proxy-placement', element: <AdminProxyPage /> },
          { path: 'proxy-placement/:id', element: <AdminProxyDetailPage /> },
          { path: 'withdrawals', element: <AdminWithdrawalsPage /> },
          { path: 'withdrawals/:id', element: <AdminWithdrawalDetailPage /> },
          { path: '3pl-verification', element: <AdminTplPage /> },
          { path: '3pl-verification/:id', element: <AdminTplDetailPage /> },
          { path: 'support', element: <AdminSupportQueuePage /> },
          { path: 'support/:id', element: <AdminTicketDetailPage /> },
          { path: 'buyers', element: <AdminBuyersPage /> },
          { path: 'buyers/:id', element: <AdminBuyerDetailPage /> },
          { path: 'regulation', element: <AdminRegulationPage /> },
          { path: 'regulation/:id', element: <AdminRegulationDetailPage /> },
          { path: 'auctions', element: <AdminAuctionsPage /> },
          { path: 'auctions/:id', element: <AdminAuctionDetailPage /> },
          { path: 'lots', element: <AdminLotsPage /> },
          { path: 'lots/:id', element: <AdminLotDetailPage /> },
          { path: 'orders', element: <AdminOrdersPage /> },
          { path: 'orders/:id', element: <AdminOrderDetailPage /> },
          { path: 'shipments', element: <AdminShipmentsPage /> },
          { path: 'shipments/:id', element: <AdminShipmentDetailPage /> },
          { path: 'transactions', element: <AdminTransactionsPage /> },
          { path: 'transactions/:id', element: <AdminTransactionDetailPage /> },
          { path: 'referrals', element: <AdminReferralsPage /> },
          { path: 'referrals/queue', element: <AdminRewardsQueuePage /> },
          { path: 'referrals/config', element: <AdminReferralConfigPage /> },
          { path: 'referrals/:id', element: <AdminReferralDetailPage /> },
          { path: 'fees', element: <AdminFeesPage /> },
          { path: 'tiers', element: <AdminTiersPage /> },
          { path: 'sync', element: <AdminSyncPage /> },
          { path: 'sync/:id', element: <AdminSyncDetailPage /> },
          { path: 'audit', element: <AdminAuditPage /> },
          { path: 'audit/:id', element: <AdminAuditDetailPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'users/new', element: <AdminUserFormPage /> },
          { path: 'users/:id', element: <AdminUserDetailPage /> },
          { path: 'users/:id/edit', element: <AdminUserFormPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <GuestGuard />,
    children: [
      { path: 'ref/:code', element: <ReferralLinkPage /> },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignupPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
