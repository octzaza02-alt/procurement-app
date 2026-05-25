import { NextRequest } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { verifyPin, createSession, clearSession } from '@/lib/auth'
import { ok, err, unauth, fail } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const { userId, pin } = await req.json()
    if (!userId || !pin) return err('ระบุ userId และ PIN')

    const db = serverClient()
    const { data: user } = await db
      .from('users').select('id,name,role,pin_hash').eq('id', userId).single()
    if (!user) return err('ไม่พบผู้ใช้', 404)

    if (!(await verifyPin(pin, user.pin_hash))) return unauth()

    await createSession({ userId: user.id, name: user.name, role: user.role })
    return ok({ id: user.id, name: user.name, role: user.role })
  } catch (e) {
    console.error(e); return fail()
  }
}

export async function DELETE() {
  clearSession()
  return ok({ message: 'ออกจากระบบแล้ว' })
}
