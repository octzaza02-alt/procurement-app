import { NextRequest } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { ok, unauth, noAccess, notFound, fail } from '@/lib/api'

type P = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: P) {
  const session = await getSession()
  if (!session) return unauth()
  if (session.role !== 'admin') return noAccess()
  try {
    const body = await req.json()
    const updates: Record<string, string> = {}
    if (body.name) updates.name = body.name
    if (body.unit) updates.unit = body.unit
    const { data, error } = await serverClient()
      .from('catalog').update(updates).eq('id', params.id).select().single()
    if (error || !data) return notFound()
    return ok(data)
  } catch (e) { console.error(e); return fail() }
}

export async function DELETE(_req: NextRequest, { params }: P) {
  const session = await getSession()
  if (!session) return unauth()
  if (session.role !== 'admin') return noAccess()
  try {
    const { error } = await serverClient().from('catalog').delete().eq('id', params.id)
    if (error) throw error
    return ok({ deleted: true })
  } catch (e) { console.error(e); return fail() }
}
