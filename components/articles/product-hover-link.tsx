import Image from 'next/image'

type ProductHoverLinkProps = {
  href: string
  imageSrc: string
  children: string
}

/** Server-safe product link with CSS-only hover preview (avoids Radix/useId hydration drift). */
export function ProductHoverLink({href, imageSrc, children}: ProductHoverLinkProps) {
  return (
    <span className="group/product relative inline">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-[#0F68B2] underline underline-offset-2 group-hover/product:text-[#0d5a9a]"
      >
        {children}
      </a>
      <span
        className="pointer-events-none invisible absolute bottom-[calc(100%+0.6rem)] left-1/2 z-20 w-36 -translate-x-1/2 rounded-xl border border-black/[0.08] bg-white p-2 opacity-0 shadow-lg transition-opacity duration-150 group-hover/product:visible group-hover/product:opacity-100 sm:w-40"
        aria-hidden
      >
        <span className="relative block aspect-square overflow-hidden rounded-lg bg-[#f3f6f8]">
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-contain p-1.5"
            sizes="160px"
          />
        </span>
      </span>
    </span>
  )
}
