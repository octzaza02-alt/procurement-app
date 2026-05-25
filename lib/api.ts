import { NextResponse } from 'next/server'

export const ok  = <T>(data: T, status = 200) =>
  NextResponse.json({ ok: true, data }, { status })

export const err = (msg: string, status = 400) =>
  NextResponse.json({ ok: false, error: msg }, { status })

export const unauth  = () => err('กรุณาเข้าสู่ระบบ', 401)
export const noAccess = () => err('ไม่มีสิทธิ์', 403)
export const notFound = () => err('ไม่พบข้อมูล', 404)
export const fail     = () => err('เกิดข้อผิดพลาด', 500)
