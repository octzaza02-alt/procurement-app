import { NextRequest } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { getSession, hashPin } from '@/lib/auth'
import { ok, err, unauth, noAccess, fail } from '@/lib/api'

// GET — list users for login screen (public, no auth needed)
export async function GET() {
  try {
    const { data, error } = await serverClient()
      .from('users').select('id,name,role,created_at').order('created_at')
    if (error) throw error
    return ok(data)
  } catch (e) { console.error(e); return fail() }
}

// POST — create user (admin only)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauth()
  if (session.role !== 'admin') return noAccess()

  try {
    const { name, pin, role } = await req.json()
    if (!name || !pin || !role) return err('ระบุชื่อ, PIN และ role')
    if (!/^\d{4}$/.test(pin))   return err('PIN ต้องเป็นตัวเลข 4 หลัก')

    const { data, error } = await serverClient()
      .from('users')
      .insert({ name, pin_hash: await hashPin(pin), role })
      .select('id,name,role,created_at').single()
    if (error) {
      if (error.code === '23505') return err('มีชื่อนี้อยู่แล้ว')
      throw error
    }
    return ok(data, 201)
  } catch (e) { console.error(e); return fail() }
}
