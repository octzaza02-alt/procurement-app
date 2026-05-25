export type Role   = 'admin' | 'user'
export type Status = 'pending' | 'delivered'

export interface User {
  id: string; name: string; role: Role; created_at: string
}
export interface CatalogItem {
  id: string; name: string; unit: string; order_count: number
}
export interface Order {
  id: string
  product_name: string
  quantity: number
  unit: string
  note: string | null
  status: Status
  requester_id: string
  requester_name: string
  delivered_at: string | null
  delivered_by_name: string | null
  created_at: string
}
