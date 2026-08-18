'use client'

import {useEffect, useRef, useState} from 'react'

const POSTER_SRC = '/videos/ekcos-hero-poster.webp'
const VIDEO_SRC = '/videos/ekcos-hero.mp4'

type HeroIntroVideoProps = {
  scrollLabel: string
  targetId?: string
}

export function HeroIntroVideo({
  scrollLabel,
  targetId = 'washroom',
}: HeroIntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setShouldLoad(true)
        observer.disconnect()
      },
      {rootMargin: '80px'},
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!shouldLoad) return
    const video = videoRef.current
    if (!video) return
    const play = video.play()
    if (play) play.catch(() => undefined)
  }, [shouldLoad])

  return (
    <div className="relative h-[calc(100dvh-4rem)] shrink-0 overflow-hidden bg-black sm:h-[calc(100dvh-4.25rem)]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        poster={POSTER_SRC}
        muted
        loop
        playsInline
        autoPlay={shouldLoad}
        preload="none"
        aria-hidden="true"
        src={shouldLoad ? VIDEO_SRC : undefined}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-t from-black/55 to-transparent"
        aria-hidden="true"
      />
      <a
        href={`#${targetId}`}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-center text-white no-underline [text-shadow:0_1px_8px_rgba(0,0,0,0.45)] hover:text-white hover:opacity-90"
      >
        <span className="max-w-[18rem] text-sm font-semibold tracking-wide sm:max-w-none sm:whitespace-nowrap">
          {scrollLabel}
        </span>
        <span className="motion-safe:animate-bounce" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </a>
    </div>
  )
}
