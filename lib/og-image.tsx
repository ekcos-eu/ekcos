import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 } as const

type OgCardInput = {
  kicker: string
  title: string
  description: string
}

export function createOgImage({ kicker, title, description }: OgCardInput) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(165deg, #d9ebf7 0%, #eef6fc 42%, #ffffff 100%)',
          color: '#575756',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            fontWeight: 700,
            color: '#0F68B2',
            letterSpacing: -1,
          }}
        >
          ëkcos
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1040 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              fontWeight: 700,
              color: '#0F68B2',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 60,
              fontWeight: 700,
              color: '#575756',
              lineHeight: 1.12,
              marginTop: 18,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              color: '#575756',
              lineHeight: 1.35,
              marginTop: 24,
              opacity: 0.88,
            }}
          >
            {description}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  )
}

export function createArticleOgImage({
  title,
  imageSrc,
}: {
  title: string
  imageSrc?: string
}) {
  if (!imageSrc) {
    return createOgImage({
      kicker: 'ëkcos · Articles',
      title,
      description: '',
    })
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: '#0F68B2',
        }}
      >
        <img
          src={imageSrc}
          width={1200}
          height={630}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 64,
            background:
              'linear-gradient(180deg, rgba(15,104,178,0) 32%, rgba(15,104,178,0.88) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            ëkcos · Articles
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 52,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.15,
              marginTop: 14,
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  )
}
