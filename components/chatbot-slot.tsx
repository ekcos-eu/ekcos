'use client'

/**
 * Reserved area for a future Chatfuel AI embed.
 * Mount your widget script to target this container or replace this component.
 */
export function ChatbotSlot() {
  return (
    <div
      id="chatbot-slot"
      className="pointer-events-none fixed bottom-6 right-6 z-30 hidden h-14 w-14 rounded-full border-2 border-dashed border-[#0F68B2]/25 bg-white/80 opacity-40 sm:block"
      aria-hidden
      title="Chatbot integration"
    />
  )
}
