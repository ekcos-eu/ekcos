import { NextResponse } from 'next/server'
import { getCountryCodeFromLocale } from '@/lib/newsletter-country'

type NewsletterRequestBody = {
  email?: string
  locale?: string
}

export async function POST(request: Request) {
  const apiKey = process.env.BREVO_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Brevo API key' }, { status: 500 })
  }

  let body: NewsletterRequestBody

  try {
    body = (await request.json()) as NewsletterRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = body.email?.trim()
  const locale = body.locale?.trim() ?? 'en'

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  const countryCode = getCountryCodeFromLocale(locale)

  try {
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        updateEnabled: true,
        attributes: {
          COUNTRY_CODE: countryCode,
        },
      }),
    })

    if (!brevoResponse.ok) {
      const errorBody = (await brevoResponse.json().catch(() => null)) as
        | { message?: string; code?: string }
        | null

      return NextResponse.json(
        {
          error: 'Brevo request failed',
          detail: errorBody?.message ?? 'Unknown Brevo error',
          code: errorBody?.code ?? null,
        },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Network error while calling Brevo' }, { status: 502 })
  }
}
