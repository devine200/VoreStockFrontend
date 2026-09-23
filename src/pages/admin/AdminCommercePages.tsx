import { useParams } from 'react-router-dom'
import { LotDetail, LotsList } from '@/components/admin/lots/LotScreens'
import { AuctionDetail, AuctionList } from '@/components/admin/auctions/AuctionScreens'
import { OrdersList, OrderDetail } from '@/components/admin/orders/OrderScreens'
import { ShipmentsList, ShipmentDetail } from '@/components/admin/shipments/ShipmentScreens'
import { TransactionsList, TransactionDetail } from '@/components/admin/transactions/TransactionScreens'
import { AdminNotFound } from '@/components/admin/screens'
import { useAppSelector } from '@/store/hooks'

export function AdminAuctionsPage() {
  return <AuctionList />
}

export function AdminAuctionDetailPage() {
  return <AuctionDetail />
}

export function AdminLotsPage() {
  return <LotsList />
}

export function AdminLotDetailPage() {
  const { id } = useParams()
  const item = useAppSelector((s) => s.admin.lots.find((r) => r.id === id))
  if (!item) return <AdminNotFound label="Back to lots" to="/admin/lots" />
  return <LotDetail item={item} />
}

export function AdminOrdersPage() {
  return <OrdersList />
}

export function AdminOrderDetailPage() {
  return <OrderDetail />
}

export function AdminShipmentsPage() {
  return <ShipmentsList />
}

export function AdminShipmentDetailPage() {
  return <ShipmentDetail />
}

export function AdminTransactionsPage() {
  return <TransactionsList />
}

export function AdminTransactionDetailPage() {
  return <TransactionDetail />
}
