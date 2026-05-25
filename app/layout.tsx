import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'ระบบสั่งของภายในองค์กร' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.2.0/dist/tabler-icons.min.css" />
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0;}
          body{font-family:system-ui,-apple-system,sans-serif;background:#f8f7f4;color:#1a1a18;min-height:100vh;}
          input,select,textarea{font-family:inherit;font-size:14px;padding:8px 12px;border:1px solid #d3d1c7;border-radius:8px;outline:none;width:100%;background:#fff;}
          input:focus,select:focus{border-color:#ef9f27;box-shadow:0 0 0 3px rgba(239,159,39,.15);}
          button{font-family:inherit;cursor:pointer;}
          .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
