import { NextResponse } from 'next/server'
import { Resend } from 'resend'

type PrivateLabelBody = {
  name?: string
  company?: string
  email?: string
  phone?: string
  products?: string
  quantity?: string
  message?: string
  website?: string
  locale?: string
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND ?? process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error('[private-label] Missing RESEND / RESEND_API_KEY')
    return NextResponse.json(
      { error: 'Email service is not configured' },
      { status: 500 }
    )
  }

  let body: PrivateLabelBody

  try {
    body = (await request.json()) as PrivateLabelBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Honeypot — bots fill this; real users leave it empty
  if (body.website?.trim()) {
    return NextResponse.json({ ok: true })
  }

  const name = body.name?.trim() ?? ''
  const company = body.company?.trim() ?? ''
  const email = body.email?.trim() ?? ''
  const phone = body.phone?.trim() ?? ''
  const products = body.products?.trim() ?? ''
  const quantity = body.quantity?.trim() ?? ''
  const message = body.message?.trim() ?? ''
  const locale = body.locale?.trim() || 'en'

  if (!name || !company || !email || !message) {
    return NextResponse.json(
      { error: 'Missing required fields: name, company, email, message' },
      { status: 400 }
    )
  }

  if (!products) {
    return NextResponse.json(
      { error: 'Please enter a quantity for at least one product' },
      { status: 400 }
    )
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const to = process.env.PRIVATE_LABEL_TO_EMAIL ?? 'support@ekcos.eu'
  const from =
    process.env.RESEND_FROM_EMAIL ?? 'ëkcos Private Label <noreply@ekcos.eu>'

  const text = [
    'New Private Label partner inquiry',
    '',
    `Name: ${name}`,
    `Company: ${company}`,
    `Email: ${email}`,
    `Phone: ${phone || '—'}`,
    `Locale: ${locale}`,
    `Products: ${products}`,
    `Total quantity: ${quantity || '—'}`,
    '',
    'Message:',
    message,
  ].join('\n')

  const html = `
    <h2>New Private Label partner inquiry</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;line-height:1.5">
      <tr><td style="padding:4px 12px 4px 0;color:#555"><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#555"><strong>Company</strong></td><td>${escapeHtml(company)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#555"><strong>Email</strong></td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#555"><strong>Phone</strong></td><td>${escapeHtml(phone || '—')}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#555"><strong>Locale</strong></td><td>${escapeHtml(locale)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#555"><strong>Products</strong></td><td>${escapeHtml(products)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#555"><strong>Total quantity</strong></td><td>${escapeHtml(quantity || '—')}</td></tr>
    </table>
    <h3 style="margin-top:24px">Message</h3>
    <p style="white-space:pre-wrap;font-family:sans-serif;font-size:14px">${escapeHtml(message)}</p>
  `

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: `Private Label inquiry — ${company}`,
      text,
      html,
    })

    if (error) {
      console.error('[private-label] Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email', detail: error.message },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[private-label] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Network error while sending email' },
      { status: 502 }
    )
  }
}
