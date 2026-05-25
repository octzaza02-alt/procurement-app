import { NextRequest } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { ok, err, unauth, noAccess, fail } from '@/lib/api'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauth()
  const q = new URL(req.url).searchParams.get('q') ?? ''
  try {
    let query = serverClient().from('catalog')
      .select('id,name,unit,order_count').order('order_count', { ascending: false }).limit(10)
    if (q) query = query.ilike('name', `%${q}%`)
    const { data, error } = await query
    if (error) throw error
    return ok(data)
  } catch (e) { console.error(e); return fail() }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauth()
  if (session.role !== 'admin') return noAccess()
  try {
    const { name, unit } = await req.json()
    if (!name) return err('ระบุชื่อสินค้า')
    const { data, error } = await serverClient()
      .from('catalog').insert({ name, unit: unit ?? 'ชิ้น' }).select().single()
    if (error) {
      if (error.code === '23505') return err('มีสินค้านี้ในคลังแล้ว')
      throw error
    }
    return ok(data, 201)
  } catch (e) { console.error(e); return fail() }
}
