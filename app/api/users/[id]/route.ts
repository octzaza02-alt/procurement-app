import { NextRequest } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { getSession, hashPin } from '@/lib/auth'
import { ok, err, unauth, noAccess, notFound, fail } from '@/lib/api'

type P = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: P) {
  const session = await getSession()
  if (!session) return unauth()
  if (session.role !== 'admin') return noAccess()

  try {
    const body = await req.json()
    const updates: Record<string, string> = {}

    if (body.role) {
      if (params.id === session.userId) return err('ไม่สามารถเปลี่ยน role ตัวเองได้')
      updates.role = body.role
    }
    if (body.pin) {
      if (!/^\d{4}$/.test(body.pin)) return err('PIN ต้องเป็นตัวเลข 4 หลัก')
      updates.pin_hash = await hashPin(body.pin)
    }

    const { data, error } = await serverClient()
      .from('users').update(updates).eq('id', params.id)
      .select('id,name,role').single()
    if (error || !data) return notFound()
    return ok(data)
  } catch (e) { console.error(e); return fail() }
}

export async function DELETE(_req: NextRequest, { params }: P) {
  const session = await getSession()
  if (!session) return unauth()
  if (session.role !== 'admin') return noAccess()
  if (params.id === session.userId) return err('ไม่สามารถลบตัวเองได้')

  try {
    const { error } = await serverClient().from('users').delete().eq('id', params.id)
    if (error) throw error
    return ok({ deleted: true })
  } catch (e) { console.error(e); return fail() }
}
