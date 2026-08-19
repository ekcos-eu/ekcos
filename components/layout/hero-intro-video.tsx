'use client'

import {useEffect, useRef, useState} from 'react'

const POSTER_SRC = '/videos/ekcos-hero-poster.webp'
const VIDEO_SRC = '/videos/ekcos-hero.mp4'

export function HeroIntroVideo() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry || entry.intersectionRatio < 0.8) return
        setShouldLoad(true)
        observer.disconnect()
      },
      {threshold: 0.8},
    )

    observer.observe(section)
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
    <div
      ref={sectionRef}
      className="relative aspect-[1280/436] w-full overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain"
        poster={POSTER_SRC}
        muted
        loop
        playsInline
        autoPlay={shouldLoad}
        preload="none"
        aria-hidden="true"
        width={1280}
        height={436}
        src={shouldLoad ? VIDEO_SRC : undefined}
      />
    </div>
  )
}
