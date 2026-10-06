'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FaqAnswer } from '@/components/faq/faq-answer'
import type { FaqCategory } from '@/lib/faq'

export function FaqAccordion({ category }: { category: FaqCategory }) {
  if (!category.items.length) return null

  return (
    <Accordion type="single" collapsible className="w-full">
      {category.items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>
            <FaqAnswer blocks={item.answer} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
