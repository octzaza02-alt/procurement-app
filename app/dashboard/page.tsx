import { getSession } from '@/lib/auth'
import { serverClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import DashboardClient from '@/app/dashboard/DashboardClient'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const db = serverClient()
  const [{ data: users }, { data: orders }, { data: catalog }] = await Promise.all([
    db.from('users').select('id,name,role,created_at').order('created_at'),
    db.from('orders').select('*').order('created_at', { ascending: false }),
    db.from('catalog').select('id,name,unit,order_count').order('order_count', { ascending: false }),
  ])

  return (
    <DashboardClient
      session={session}
      initialUsers={users ?? []}
      initialOrders={orders ?? []}
      initialCatalog={catalog ?? []}
    />
  )
}
