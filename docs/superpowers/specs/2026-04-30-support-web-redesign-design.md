# EKCOS Support Web Redesign - Design Spec

## Context

The current support website feels overdesigned, text-heavy, and visually busy.  
Its role is to support the e-shop at [https://eshop.ekcos.eu](https://eshop.ekcos.eu), not replace it.

The redesign direction is:

- Keep existing top navigation structure
- Prioritize educational content over direct product sales content
- Reduce text volume
- Remove visual overload and continuous effects
- Use conservative minimalism while preserving EKCOS brand identity

## Goals

- Make the site calmer, cleaner, and easier to scan
- Clarify educational value (especially around Eco One)
- Improve CTA path toward e-shop and contact
- Keep the website lightweight as a support layer to the e-shop

## Non-goals

- No information architecture rewrite of top-level menu
- No full e-shop functionality in this support web
- No heavy motion design or decorative animation systems

## Target UX Principles

- One purpose per section
- Short paragraphs (2-3 sentences max)
- One primary CTA + one secondary CTA per page section block
- Homepage is a directional overview, not a full catalog
- Visual calmness over novelty

## Content Budgets (Hard Limits)

- **Homepage hero:** headline <= 10 words, subcopy <= 18 words
- **Homepage section intros:** <= 40 words per section
- **Eco One main section text:** <= 80 words per block
- **Products support copy:** <= 60 words before configurator/content entry
- **Contact intro:** <= 30 words
- **Paragraph length:** max ~220 characters; split long blocks
- **CTA count:** max 1 primary + 1 secondary CTA per major section

Locale handling rule:

- Budgets are semantic targets, not literal translated character parity. Localized copy may exceed limits by up to ~15% if needed to preserve meaning and natural phrasing.

## Information Design

### Homepage

Homepage should be reduced to 4 sections max:

1. **Hero**  
   One clear value proposition, one short explanatory sentence, two CTAs.
2. **Eco One education block**  
   Why it matters and what user learns next.
3. **Products in brief**  
   Short bridge section pointing to `/products` (no deep specs on homepage).
4. **Final action block**  
   Primary CTA to e-shop, secondary CTA to contact.

### Eco One Page

Primary educational page with 3 concise blocks:

1. What it is
2. Why it is better
3. How it works in practice

### Products Page

Keep as catalog gateway and configuration entry point, but tighten supporting copy and reduce explanatory repetition.
Scope guardrail: in this redesign phase, no functional rework of configurator logic; visual and copy simplification only.

### Contact Page

Minimal format:

- Short intro
- Contact method/form
- Essential company details only

### Custom Branding Page

Keep message focused and concise; remove duplicated persuasion copy.

## Visual System

- **Typography:** limited hierarchy (`H1`, `H2`, body, small helper text)
- **Color:** EKCOS blue as accent; mostly neutral backgrounds and text
- **Components:** consistent spacing, border radius, button styles, hover states
- **Imagery:** fewer but stronger visuals, no dense image walls on homepage
- **Motion:** remove continuous animation; keep subtle transitions only (about 150-200ms)

### Visual Tokens

- **Spacing scale:** 8, 12, 16, 24, 32, 48, 64
- **Border radius:** 8 (default), 12 (cards), 9999 (pill badges only)
- **Shadows:** none by default; one subtle level only where needed for elevation
- **Motion properties:** `opacity`, `color`, `transform` only; duration 150-200ms; no infinite loops

## Interaction and Accessibility

- Clear focus states on all controls
- Preserve keyboard navigability in header and mobile menu
- Keep external shop links explicit and consistent
- Ensure readability with improved spacing and shorter line lengths
- Baseline target: WCAG 2.1 AA checks for contrast, focus visibility, and link purpose

## Architecture and Component Boundaries

- Keep React Server Components where possible
- Leave menu structure unchanged
- Centralize visual simplification through shared UI primitives:
  - `components/section.tsx`
  - `components/ui/button.tsx`
  - shared layout components
- Keep page-specific messaging within route-level view components

## Error Handling

Use proper boundaries for risky interactive zones (e.g., product configurator region and async integrations) so failures degrade gracefully instead of breaking page rendering.

Minimum fallback behavior:

- Show non-blocking fallback message within failed block
- Keep surrounding page content interactive
- Provide at least one next action link (products or contact) from fallback state

Required boundary scope for this redesign pass:

- Product configurator block on homepage and products page
- Newsletter form block in footer

## Testing Strategy

- Manual UX walkthrough for key routes in desktop/mobile
- Verify CTA path consistency to e-shop
- Validate locale pages keep the same simplified structure and follow identical content-budget rules
- Quick accessibility pass:
  - Keyboard traversal
  - Focus visibility
  - Heading order sanity
  - Color contrast checks

## CTA Taxonomy

- **Primary CTA label family:** "Go to shop" / locale equivalent -> `https://eshop.ekcos.eu`
- **Secondary CTA label family:** "Contact us" / locale equivalent -> locale route `/{locale}/contact`
- **Educational CTA label family:** "Learn more" / locale equivalent -> page-specific educational route

Do/Don't:

- Do keep CTA labels consistent by intent across pages
- Don't mix primary intent (shop) with multiple competing primary actions

## Rollout Plan

1. **Phase 1:** Homepage reduction and hero simplification  
   Exit criteria: 4 sections max, no continuous hero animation, all sections within content budgets.
2. **Phase 2:** Shared visual system cleanup (buttons, sections, spacing, typography)  
   Exit criteria: tokenized spacing/radius/motion applied to shared primitives.
3. **Phase 3:** Content trimming on key supporting pages (`/eco-one`, `/products`, `/contact`, `/custom-branding`)  
   Exit criteria: page text fits budgets; CTA taxonomy applied.
4. **Phase 4:** CSS cleanup and consistency across locales  
   Exit criteria: removed deprecated animation styles; locale parity check complete.
5. **Phase 5:** QA and final UX tuning  
   Exit criteria: manual QA pass complete on desktop/mobile + baseline accessibility checks.

## Success Criteria

- Homepage has max 4 core sections
- No continuous/decorative animations remain on primary pages
- Paragraphs follow the hard content budgets in this spec
- Hero communicates value proposition + 2 actions in first viewport on desktop and mobile
- First viewport QA reference:
  - mobile: 390x844
  - desktop: 1440x900
- Users can choose between educational path and e-shop path within 5 seconds in a quick hallway test
- No material Core Web Vitals regressions on homepage (LCP/CLS baseline should stay same or improve)
