'use client'

import Image from 'next/image'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from '@/i18n/routing'

type ProductHoverLinkProps = {
  href: string
  imageSrc: string
  alt: string
  children: string
  /** Open in a new tab (Shopify / external). Defaults to false for site product pages. */
  external?: boolean
}

type PreviewPos = {
  left: number
  top: number
  placeBelow: boolean
}

const PREVIEW_W = 160
const PREVIEW_H = 168
const GAP = 10

const LINK_CLASS =
  'font-semibold text-[#0F68B2] underline underline-offset-2 hover:text-[#0d5a9a]'

/** Product link with fixed-position hover preview (portal — works inside overflow/accordion). */
export function ProductHoverLink({
  href,
  imageSrc,
  alt,
  children,
  external = false,
}: ProductHoverLinkProps) {
  const anchorRef = useRef<HTMLAnchorElement>(null)
  const [pos, setPos] = useState<PreviewPos | null>(null)
  const [mounted, setMounted] = useState(false)
  const previewId = useId()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!pos) return

    const hide = () => setPos(null)
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    return () => {
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    }
  }, [pos])

  function showPreview() {
    const el = anchorRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const placeBelow = rect.top < PREVIEW_H + GAP + 12
    const left = Math.min(
      Math.max(rect.left + rect.width / 2, PREVIEW_W / 2 + 8),
      window.innerWidth - PREVIEW_W / 2 - 8,
    )
    const top = placeBelow ? rect.bottom + GAP : rect.top - GAP
    setPos({ left, top, placeBelow })
  }

  const sharedProps = {
    ref: anchorRef,
    className: LINK_CLASS,
    'aria-describedby': pos ? previewId : undefined,
    onMouseEnter: showPreview,
    onMouseLeave: () => setPos(null),
    onFocus: showPreview,
    onBlur: () => setPos(null),
  } as const

  return (
    <>
      {external ? (
        <a
          {...sharedProps}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ) : (
        <Link {...sharedProps} href={href}>
          {children}
        </Link>
      )}
      {mounted &&
        pos &&
        createPortal(
          <span
            id={previewId}
            role="tooltip"
            className="pointer-events-none fixed z-[100] w-36 rounded-xl border border-black/[0.08] bg-white p-2 shadow-lg sm:w-40"
            style={{
              left: pos.left,
              top: pos.top,
              transform: pos.placeBelow
                ? 'translate(-50%, 0)'
                : 'translate(-50%, -100%)',
            }}
            aria-hidden
          >
            <span className="relative block aspect-square overflow-hidden rounded-lg bg-[#f3f6f8]">
              <Image
                src={imageSrc}
                alt={alt}
                fill
                className="object-contain p-1.5"
                sizes="160px"
              />
            </span>
          </span>,
          document.body,
        )}
    </>
  )
}
