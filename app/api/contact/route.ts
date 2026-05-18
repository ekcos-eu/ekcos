import { NextResponse } from 'next/server'

type Body = {
  name?: string
  company?: string
  email?: string
  phone?: string
  message?: string
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const message = String(body.message ?? '').trim()

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  // Wire to email provider or CRM later; log server-side in development only.
  if (process.env.NODE_ENV === 'development') {
    console.info('[contact]', { name, email, company: body.company, phone: body.phone, message })
  }

  return NextResponse.json({ ok: true })
}
