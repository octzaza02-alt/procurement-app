import { NextRequest } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { ok, err, unauth, noAccess, notFound, fail } from '@/lib/api'

type P = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: P) {
  const session = await getSession()
  if (!session) return unauth()
  try {
    const db = serverClient()
    const { data: order } = await db.from('orders').select('*').eq('id', params.id).single()
    if (!order) return notFound()

    const body = await req.json()

    if (body.action === 'deliver') {
      if (session.role !== 'admin') return noAccess()
      const { data, error } = await db.from('orders')
        .update({ status: 'delivered', delivered_at: new Date().toISOString(), delivered_by_name: session.name })
        .eq('id', params.id).select().single()
      if (error) throw error
      return ok(data)
    }

    if (body.action === 'undo_deliver') {
      if (session.role !== 'admin') return noAccess()
      const { data, error } = await db.from('orders')
        .update({ status: 'pending', delivered_at: null, delivered_by_name: null })
        .eq('id', params.id).select().single()
      if (error) throw error
      return ok(data)
    }

    // edit quantity / note
    if (order.requester_id !== session.userId && session.role !== 'admin') return noAccess()
    if (order.status === 'delivered') return err('รายการที่จัดส่งแล้วแก้ไขไม่ได้')

    const updates: Record<string, unknown> = {}
    if (body.quantity !== undefined) {
      if (body.quantity < 1) return err('จำนวนต้องมากกว่า 0')
      updates.quantity = body.quantity
    }
    if (body.note !== undefined) updates.note = body.note

    const { data, error } = await db.from('orders')
      .update(updates).eq('id', params.id).select().single()
    if (error) throw error
    return ok(data)
  } catch (e) { console.error(e); return fail() }
}

export async function DELETE(_req: NextRequest, { params }: P) {
  const session = await getSession()
  if (!session) return unauth()
  try {
    const db = serverClient()
    const { data: order } = await db.from('orders').select('requester_id').eq('id', params.id).single()
    if (!order) return notFound()
    if (order.requester_id !== session.userId && session.role !== 'admin') return noAccess()
    const { error } = await db.from('orders').delete().eq('id', params.id)
    if (error) throw error
    return ok({ deleted: true })
  } catch (e) { console.error(e); return fail() }
}
