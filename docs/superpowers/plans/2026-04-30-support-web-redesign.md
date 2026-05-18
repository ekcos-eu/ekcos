# EKCOS Support Web Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a calmer, education-first support website by reducing text density and removing visual overload while keeping current navigation and clear paths to the e-shop.

**Architecture:** Implement redesign primarily at route view and shared UI primitive level. Keep existing route structure and menu, simplify section composition and copy budgets, and enforce motion/token constraints in shared styles/components. Add targeted error boundaries around high-risk interactive blocks so page rendering remains resilient.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, next-intl, shadcn/radix UI primitives.

---

## File Structure

**Modify (core UI/layout):**
- `components/home/home-view.tsx` (homepage section reduction + static hero)
- `components/section.tsx` (tokenized spacing/background simplification)
- `components/ui/button.tsx` (consistent visual and focus states)
- `app/globals.css` (remove continuous animation styles; motion tokens)

**Modify (support pages/content trimming):**
- `app/[locale]/eco-one/page.tsx`
- `app/[locale]/products/page.tsx`
- `app/[locale]/contact/page.tsx`
- `app/[locale]/custom-branding/page.tsx`

**Modify (shared layout + resilience):**
- `components/layout/site-header.tsx` (keep structure, ensure calm visuals + a11y consistency)
- `components/layout/site-footer.tsx` (shorter copy framing + cleaner layout)
- `components/newsletter/footer-newsletter-form.tsx` (error-boundary-friendly behavior)
- `components/products/product-configurator.tsx` (boundary wrapping compatibility)

**Modify (content + i18n constraints):**
- `dictionaries/en.json`
- `dictionaries/de.json`
- `dictionaries/es.json`
- `dictionaries/fr.json`
- `dictionaries/it.json`

**Create (error boundaries):**
- `components/error-boundaries/configurator-boundary.tsx`
- `components/error-boundaries/newsletter-boundary.tsx`

**Validation:**
- `package.json` scripts (`lint`, `build`) and manual route checks in dev server

**QA route matrix (required):**
- `/{locale}` (home), `/{locale}/eco-one`, `/{locale}/products`, `/{locale}/contact`, `/{locale}/custom-branding`
- Locales minimum: `en`, `de`, plus one of `es|fr|it`

## Chunk 1: Homepage Simplification + Visual Overload Removal

### Task 1: Replace animated homepage hero with static, calm hero

**Files:**
- Modify: `components/home/home-view.tsx`
- Modify: `app/globals.css`
- Test: visual check in `/[locale]`

- [ ] **Step 1: Verify baseline fails spec**

Run: `npm run dev`  
Expected: current homepage does not meet redesign spec.

- [ ] **Step 2: Remove animated hero grid imports/state/building logic**
- [ ] **Step 3: Replace animated hero markup with static hero markup**
- [ ] **Step 4: Ensure homepage section order is exactly 4 core blocks**

Order:
1) Hero, 2) Eco One education, 3) Products bridge, 4) Final CTA.

- [ ] **Step 5: Remove obsolete hero animation CSS utilities**

Delete/retire animation classes in `app/globals.css` used only by removed hero movement.
Keep only subtle interaction transitions.

- [ ] **Step 6: Verify pass against homepage criteria**

Run: `npm run lint`  
Expected: PASS.

Manual verify:
- No continuous/decorative animation on homepage
- 4 core sections max
- Hero contains clear value proposition and 2 actions

- [ ] **Step 7: Commit**

```bash
git add components/home/home-view.tsx app/globals.css
git commit -m "refactor: simplify homepage layout and remove continuous hero animation"
```

### Task 2: Align section/button primitives with calm design tokens

**Files:**
- Modify: `components/section.tsx`
- Modify: `components/ui/button.tsx`
- Test: homepage and key routes visual consistency

- [ ] **Step 1: Normalize section spacing classes to token targets (8/12/16/24/32/48/64)**
- [ ] **Step 2: Normalize section/card radius classes to token targets (8/12 only)**
- [ ] **Step 3: Apply consistent `focus-visible` ring behavior to all button variants**
- [ ] **Step 4: Reduce non-essential decorative styles (heavy shadows/over-accented surfaces)**
- [ ] **Step 5: Run verification**

Run: `npm run lint`  
Expected: PASS.

Manual verify:
- consistent spacing rhythm
- EKCOS blue used as accent, not dominant fill everywhere
- hover/focus transitions remain subtle (150-200ms behavior target)

- [ ] **Step 6: Commit**

```bash
git add components/section.tsx components/ui/button.tsx
git commit -m "style: normalize section and button primitives for calm visual system"
```

## Chunk 2: Education-First Content Trimming on Key Routes

### Task 3: Trim copy and simplify structure on Eco One page

**Files:**
- Modify: `app/[locale]/eco-one/page.tsx`
- Modify: `dictionaries/en.json`
- Modify: `dictionaries/de.json`
- Modify: `dictionaries/es.json`
- Modify: `dictionaries/fr.json`
- Modify: `dictionaries/it.json`
- Test: `/[locale]/eco-one`

- [ ] **Step 1: Refactor page skeleton into 3 educational blocks (what it is / why better / how works)**
- [ ] **Step 2: Trim English copy to hard budgets (hero and section rules from spec)**
- [ ] **Step 3: Update DE/ES/FR/IT copy with max +15% locale allowance**
- [ ] **Step 4: Align CTA labels/routes to taxonomy rules**
- [ ] **Step 5: Verify**

Run: `npm run lint`  
Expected: PASS.

Manual verify on at least `en`, `de`:
- same structure
- copy remains concise and educational-first

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/eco-one/page.tsx dictionaries/en.json dictionaries/de.json dictionaries/es.json dictionaries/fr.json dictionaries/it.json
git commit -m "content: tighten eco-one page into concise education-first structure"
```

### Task 4: Trim products/contact/custom-branding route copy without IA changes

**Files:**
- Modify: `app/[locale]/products/page.tsx`
- Modify: `app/[locale]/contact/page.tsx`
- Modify: `app/[locale]/custom-branding/page.tsx`
- Modify: `dictionaries/en.json`
- Modify: `dictionaries/de.json`
- Modify: `dictionaries/es.json`
- Modify: `dictionaries/fr.json`
- Modify: `dictionaries/it.json`
- Test: `/[locale]/products`, `/[locale]/contact`, `/[locale]/custom-branding`

- [ ] **Step 1: Trim `/products` intro/support copy to budget targets**
- [ ] **Step 2: Trim `/contact` intro to minimal practical format**
- [ ] **Step 3: Trim `/custom-branding` sections and remove repeated persuasion copy**
- [ ] **Step 4: Update locale dictionaries for these routes (en/de/es/fr/it)**
- [ ] **Step 5: Enforce one primary + one secondary CTA pattern per major block**
- [ ] **Step 6: Verify**

Run: `npm run lint`  
Expected: PASS.

Manual verify:
- menu unchanged
- contact page minimal intro + practical action
- no verbose persuasive repetition

- [ ] **Step 7: Commit**

```bash
git add app/[locale]/products/page.tsx app/[locale]/contact/page.tsx app/[locale]/custom-branding/page.tsx dictionaries/en.json dictionaries/de.json dictionaries/es.json dictionaries/fr.json dictionaries/it.json
git commit -m "content: simplify support pages and enforce concise CTA-focused structure"
```

## Chunk 3: Error Boundaries, Layout Polish, and Final QA

### Task 5: Add required error boundaries for configurator and newsletter zones

**Files:**
- Create: `components/error-boundaries/configurator-boundary.tsx`
- Create: `components/error-boundaries/newsletter-boundary.tsx`
- Modify: `components/home/home-view.tsx`
- Modify: `app/[locale]/products/page.tsx`
- Modify: `components/layout/site-footer.tsx`
- Modify: `components/newsletter/footer-newsletter-form.tsx`
- Modify: `components/products/product-configurator.tsx`
- Test: homepage, products, footer newsletter

- [ ] **Step 1: Create `configurator-boundary` client component with typed fallback props**
- [ ] **Step 2: Create `newsletter-boundary` client component with typed fallback props**
- [ ] **Step 3: Wrap homepage configurator embedding point**
- [ ] **Step 4: Wrap products page configurator embedding point**
- [ ] **Step 5: Wrap newsletter form block in footer**
- [ ] **Step 6: Ensure each fallback includes at least one action link (products/contact)**
- [ ] **Step 7: Verify**

Run: `npm run lint && npm run build`  
Expected: PASS.

Manual verify (deterministic fault injection):
- Temporarily add `throw new Error('Boundary test')` behind a local test flag in configurator render path; confirm fallback renders and rest of page is usable.
- Temporarily add `throw new Error('Boundary test')` behind a local test flag in newsletter form render path; confirm footer fallback renders and rest of page is usable.
- Remove test throws before commit.

- [ ] **Step 8: Commit**

```bash
git add components/error-boundaries/configurator-boundary.tsx components/error-boundaries/newsletter-boundary.tsx components/home/home-view.tsx app/[locale]/products/page.tsx components/layout/site-footer.tsx components/newsletter/footer-newsletter-form.tsx components/products/product-configurator.tsx
git commit -m "feat: add targeted error boundaries for configurator and newsletter blocks"
```

### Task 6: Final consistency and acceptance sweep

**Files:**
- Modify as needed: touched files from previous tasks
- Test: all primary locale routes and shared layout

- [ ] **Step 1: Run full static checks**

Run: `npm run lint && npm run build`  
Expected: PASS.

- [ ] **Step 2: Manual QA pass for acceptance criteria**

Check:
- homepage max 4 sections
- no continuous/decorative motion on primary pages
- content budgets respected (locale semantic margin applied)
- hero first viewport clarity (390x844, 1440x900)
- keyboard focus and link purpose clarity
- CTA taxonomy consistency by intent

- [ ] **Step 3: Prepare final implementation commit (scoped staging only)**

```bash
git add components/home/home-view.tsx app/globals.css components/section.tsx components/ui/button.tsx app/[locale]/eco-one/page.tsx app/[locale]/products/page.tsx app/[locale]/contact/page.tsx app/[locale]/custom-branding/page.tsx components/error-boundaries/configurator-boundary.tsx components/error-boundaries/newsletter-boundary.tsx components/layout/site-footer.tsx components/newsletter/footer-newsletter-form.tsx components/products/product-configurator.tsx dictionaries/en.json dictionaries/de.json dictionaries/es.json dictionaries/fr.json dictionaries/it.json
git commit -m "refactor: deliver calm education-first support web redesign"
```

- [ ] **Step 4: Record residual risks and follow-up backlog**

Capture any deferred improvements (if any) as explicit follow-ups in project notes/issue tracker.
