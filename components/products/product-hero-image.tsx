'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Props = {
  src: string
  alt: string
  className?: string
}

/**
 * Interactive product hero: 3D tilt + hover scale.
 */
export function ProductHeroImage({ src, alt, className }: Props) {
  const reduceMotion = useReducedMotion()
  const stageRef = React.useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = React.useState(false)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const rotateX = useSpring(rawY, { stiffness: 180, damping: 22, mass: 0.6 })
  const rotateY = useSpring(rawX, { stiffness: 180, damping: 22, mass: 0.6 })
  const translateX = useSpring(0, { stiffness: 120, damping: 20 })
  const translateY = useSpring(0, { stiffness: 120, damping: 20 })

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return

    const nx = (e.clientX - rect.left) / rect.width
    const ny = (e.clientY - rect.top) / rect.height
    const px = (nx - 0.5) * 2
    const py = (ny - 0.5) * 2

    rawX.set(px * 14)
    rawY.set(py * -10)
    translateX.set(px * 12)
    translateY.set(py * 10)
  }

  const handlePointerLeave = () => {
    setHovered(false)
    rawX.set(0)
    rawY.set(0)
    translateX.set(0)
    translateY.set(0)
  }

  return (
    <div
      ref={stageRef}
      className={cn(
        'product-hero-stage relative h-full w-full overflow-hidden rounded-2xl',
        className,
      )}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center p-6 sm:p-10"
        style={{
          perspective: 900,
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
          x: reduceMotion ? 0 : translateX,
          y: reduceMotion ? 0 : translateY,
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          className="relative h-full w-full"
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: hovered ? 1.06 : 1,
                }
          }
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority
            className="object-contain drop-shadow-xl"
            sizes="(max-width: 1024px) 100vw, 50vw"
            draggable={false}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
