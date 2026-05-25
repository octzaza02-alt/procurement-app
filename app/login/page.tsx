import { serverClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LoginClient from './LoginClient'

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  const { data: users } = await serverClient()
    .from('users').select('id,name,role').order('created_at')

  return <LoginClient users={users ?? []} />
}
