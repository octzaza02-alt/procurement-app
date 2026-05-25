import { NextRequest } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { ok, err, unauth, fail } from '@/lib/api'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauth()
  try {
    const sp     = new URL(req.url).searchParams
    const status = sp.get('status')
    const db     = serverClient()
    let query    = db.from('orders').select('*').order('created_at', { ascending: false })

    if (session.role !== 'admin') query = query.eq('requester_id', session.userId)
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error
    return ok(data)
  } catch (e) { console.error(e); return fail() }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauth()
  try {
    const { product_name, quantity, unit, note } = await req.json()
    if (!product_name || !quantity) return err('ระบุชื่อสินค้าและจำนวน')
    if (quantity < 1) return err('จำนวนต้องมากกว่า 0')

    const db = serverClient()
    const { data: order, error } = await db
      .from('orders')
      .insert({ product_name, quantity, unit: unit ?? 'ชิ้น', note: note ?? null,
                status: 'pending', requester_id: session.userId, requester_name: session.name })
      .select().single()
    if (error) throw error

    // update catalog count
    await db.rpc('upsert_catalog', { p_name: product_name, p_unit: unit ?? 'ชิ้น' })

    return ok(order, 201)
  } catch (e) { console.error(e); return fail() }
}
