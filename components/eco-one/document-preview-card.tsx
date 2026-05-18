import Image from 'next/image'
import { cn } from '@/lib/utils'

type DocumentPreviewCardProps = {
  src: string
  alt: string
  title: string
  body: string
  className?: string
}

export function DocumentPreviewCard({ src, alt, title, body, className }: DocumentPreviewCardProps) {
  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="relative aspect-[3/4] border-b border-black/[0.06] bg-[#f8fafc] sm:aspect-[4/5]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-sm font-semibold leading-snug text-[#575756] text-balance">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#575756]/80 text-pretty">{body}</p>
      </div>
    </article>
  )
}
