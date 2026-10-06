'use client'

import {
  createProductImageAltLookup,
  linkifyPlainText,
} from '@/lib/article-product-links'
import type { FaqAnswerBlock } from '@/lib/faq'
import { useTranslations } from 'next-intl'

export function FaqAnswer({ blocks }: { blocks: FaqAnswerBlock[] }) {
  const t = useTranslations('products')
  const getImageAlt = createProductImageAltLookup((key) => t(key))

  return (
    <div className="space-y-3 text-[#575756]">
      {blocks.map((block, i) => {
        if (block.type === 'paragraph') {
          return (
            <p
              key={i}
              className="text-justify text-base leading-relaxed sm:text-[1.05rem] sm:leading-[1.65]"
            >
              {linkifyPlainText(block.text, getImageAlt)}
            </p>
          )
        }
        if (block.type === 'list') {
          return (
            <ul
              key={i}
              className="list-disc space-y-2 pl-5 text-base leading-relaxed sm:text-[1.05rem]"
            >
              {block.items.map((item, j) => (
                <li key={j} className="text-justify pl-1">
                  {linkifyPlainText(item, getImageAlt)}
                </li>
              ))}
            </ul>
          )
        }
        return (
          <div key={i} className="overflow-x-auto rounded-lg border border-black/[0.08]">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm sm:text-base">
              <thead>
                <tr className="bg-[#eef6fc] text-[#0F68B2]">
                  {block.headers.map((h) => (
                    <th key={h} className="px-3 py-2.5 font-semibold">
                      {linkifyPlainText(h, getImageAlt)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri} className="border-t border-black/[0.06] align-top">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2.5 text-[#575756]">
                        {linkifyPlainText(cell, getImageAlt)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}
