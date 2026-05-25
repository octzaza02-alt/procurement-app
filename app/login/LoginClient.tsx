'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type User = { id: string; name: string; role: string }

function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

export default function LoginClient({ users }: { users: User[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<User | null>(null)
  const [pin, setPin]           = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function tryLogin(fullPin: string) {
    if (!selected) return
    setLoading(true)
    setError('')
    const res  = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selected.id, pin: fullPin }),
    })
    setLoading(false)
    if (res.ok) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setError('PIN ไม่ถูกต้อง กรุณาลองใหม่')
      setPin('')
    }
  }

  function pressDigit(d: string) {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError('')
    if (next.length === 4) setTimeout(() => tryLogin(next), 180)
  }

  function selectUser(u: User) {
    setSelected(u); setPin(''); setError('')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 52, height: 52, background: '#FAEEDA', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <i className="ti ti-clipboard-list" style={{ fontSize: 26, color: '#854F0B' }} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 500 }}>ระบบสั่งของภายในองค์กร</h1>
          <p style={{ fontSize: 13, color: '#888780', marginTop: 4 }}>เลือกชื่อของคุณแล้วใส่ PIN</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #d3d1c7', borderRadius: 12, padding: '1.25rem' }}>
          {/* User list */}
          <p style={{ fontSize: 12, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>เลือกผู้ใช้</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' }}>
            {users.map(u => (
              <button key={u.id} onClick={() => selectUser(u)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: selected?.id === u.id ? '#FAEEDA' : '#f8f7f4', border: `1px solid ${selected?.id === u.id ? '#EF9F27' : 'transparent'}`, borderRadius: 8, transition: 'border-color .15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.role === 'admin' ? '#E1F5EE' : '#E6F1FB', color: u.role === 'admin' ? '#0F6E56' : '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500 }}>
                    {initials(u.name)}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</span>
                </div>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: u.role === 'admin' ? '#E1F5EE' : '#E6F1FB', color: u.role === 'admin' ? '#0F6E56' : '#185FA5' }}>
                  {u.role === 'admin' ? 'แอดมิน' : 'ผู้ใช้'}
                </span>
              </button>
            ))}
          </div>

          {/* PIN pad */}
          {selected && (
            <div>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#5F5E5A', marginBottom: 8 }}>
                PIN ของ <strong>{selected.name}</strong>
              </p>
              {/* Dots */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid', borderColor: i < pin.length ? '#BA7517' : '#d3d1c7', background: i < pin.length ? '#BA7517' : 'transparent', transition: 'background .15s' }} />
                ))}
              </div>
              {/* Pad */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {['1','2','3','4','5','6','7','8','9'].map(d => (
                  <button key={d} onClick={() => pressDigit(d)} disabled={loading}
                    style={{ padding: 10, background: '#f8f7f4', border: '1px solid #d3d1c7', borderRadius: 8, fontSize: 16, fontWeight: 500 }}>
                    {d}
                  </button>
                ))}
                <button onClick={() => { setPin(p => p.slice(0,-1)); setError('') }}
                  style={{ padding: 10, background: '#f8f7f4', border: '1px solid #d3d1c7', borderRadius: 8, fontSize: 13, color: '#888780' }}>
                  <i className="ti ti-backspace" />
                </button>
                <button onClick={() => pressDigit('0')} disabled={loading}
                  style={{ padding: 10, background: '#f8f7f4', border: '1px solid #d3d1c7', borderRadius: 8, fontSize: 16, fontWeight: 500 }}>
                  0
                </button>
                <button onClick={() => { setPin(''); setError('') }}
                  style={{ padding: 10, background: '#f8f7f4', border: '1px solid #d3d1c7', borderRadius: 8, fontSize: 13, color: '#888780' }}>
                  ล้าง
                </button>
              </div>
              {error && <p style={{ fontSize: 12, color: '#A32D2D', textAlign: 'center', marginTop: 8 }}>{error}</p>}
              {loading && <p style={{ fontSize: 12, color: '#888780', textAlign: 'center', marginTop: 8 }}>กำลังเข้าสู่ระบบ...</p>}
            </div>
          )}

          {/* Contact admin note */}
          <div style={{ marginTop: '1rem', padding: '10px 14px', background: '#f8f7f4', borderRadius: 8, border: '1px solid #d3d1c7', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#888780' }}>
            <i className="ti ti-info-circle" style={{ flexShrink: 0 }} />
            <span>ไม่มีชื่อของคุณ? กรุณาติดต่อแอดมินเพื่อสร้างบัญชีผู้ใช้</span>
          </div>
        </div>
      </div>
    </div>
  )
}
