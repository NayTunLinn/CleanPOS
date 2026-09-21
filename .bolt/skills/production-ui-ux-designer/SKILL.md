---
name: production-ui-ux-designer
description: Use when designing or redesigning UI in any project, especially TanStack Start + Tailwind CSS v4 + shadcn/ui. Triggers on "design", "UI", "UX", "modern", "clean", "professional", "production grade", "component", "layout", "typography", "color system", or "make it look better".
---

# Production UI/UX Designer

## When to use
- The user asks for a new page, component, or visual redesign.
- The user wants something to look "clean", "modern", "professional", "premium", or "production grade".
- You are choosing colors, typography, spacing, layout, or component styling.
- You are about to write ad-hoc Tailwind classes or inline styles.

## Core philosophy

Clean, compact, modern, professional UI is achieved through restraint, not decoration. Prefer clarity over novelty, consistency over customization, and density over whitespace. Every visual decision should serve readability, hierarchy, or affordance.

## Pre-build checklist

Run through this list before finishing any UI task:

1. [ ] Colors come from semantic tokens, not literal hex classes.
2. [ ] Typography has a clear hierarchy: one display/heading style and one body style.
3. [ ] Spacing is tight, rhythmic, and based on a 4-pt scale.
4. [ ] Components reuse existing variants or extend them, rather than one-off classes.
5. [ ] Dark mode values exist for every custom token added.
6. [ ] All interactive elements have visible focus and hover states.
7. [ ] Layout works from 320px to 1920px without horizontal scroll.
8. [ ] No placeholder content, placeholder images, or "lorem ipsum" left behind.
9. [ ] Motion is subtle and purposeful, never decorative.
10. [ ] The result avoids generic AI aesthetics (purple gradients, floating blobs, interchangeable hero sections).

## Rules

### 1. Use semantic design tokens

- Define every color, radius, and shadow as a CSS variable in the global design system (`src/styles.css` or `index.css`), not as a one-off Tailwind value.
- Map variables to Tailwind utilities via `@theme inline` so classes like `bg-primary`, `text-muted-foreground`, and `border-border` work.
- Prefer `oklch()` for all color values.
- When adding a new color, add it to both `:root` (light) and `.dark` (dark) with matching semantic intent.

### 2. Keep colors restrained

- Limit the active palette to: background, foreground, primary, secondary, muted, accent, destructive, border, input, ring.
- Use one primary action color. Use neutrals for 80% of surfaces.
- Avoid gradients unless they carry meaning (progress, heat, brand). Never use gradients purely as decoration.
- Avoid hardcoded utilities such as `text-white`, `bg-black`, `bg-[#...]`, `text-[#...]`.

### 3. Design for both themes

- Light mode: high-contrast text on light surfaces, subtle borders, crisp shadows.
- Dark mode: slightly desaturated tones, lighter borders with low opacity (`oklch(... / 10%)`), reduced shadows.
- Test every custom color pair in both modes for contrast.

### 4. Typography: one heading family, one body family

- Use at most two fonts per project: one for headings and one for body/UI.
- Curated pairings for production projects:
  - Modern tech: `space-grotesk-dm-sans`
  - Digital tools/SaaS: `sora-manrope`
  - Editorial/premium: `instrument-serif-work-sans` or `dm-serif-display-fira-sans`
  - Finance/legal: `libre-baskerville-ibm-plex`
- Use a type scale, not arbitrary sizes. Example scale: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`.
- Avoid more than four font weights on one page.

### 5. Spacing: compact and rhythmic

- Base unit is `0.25rem` (4px). Use multiples of it consistently.
- Default compact spacing for production UIs:
  - Card/internal padding: `p-4` to `p-6`.
  - Section gaps: `gap-6` to `gap-10`.
  - Page horizontal padding: `px-4` mobile, `px-6` tablet, `px-8` desktop.
- Prefer `gap` over margin where possible; it keeps layouts predictable.
- Avoid whitespace that breaks the rhythm or makes the UI feel unfinished.

### 6. Layout: structured and responsive

- Use container queries or `max-w-*` wrappers to keep line length readable (max ~70ch for body text).
- Build mobile-first: start at 320px and expand with `sm:`, `md:`, `lg:` breakpoints.
- Use grids for lists and cards; use flex for navigation, form rows, and alignment.
- Avoid absolute positioning for primary layout. Reserve it for decorative overlays and badges.

### 7. Components: extend, don't override

- Use shadcn/ui components when available; customize through variants and CSS variables, not one-off class strings.
- When a component needs a new variant, define it in the component file or a shared variant map, then reference it by name.
- Bad: `<Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">`.
- Good: `<Button variant="primary">` with the variant defined in the design system.
- Buttons should have clear hierarchy: one primary style, one secondary/outline style, one ghost/tertiary style.
- Inputs should share the same border radius, focus ring, and height as buttons in the same form.

### 8. Cards, surfaces, and elevation

- Use one surface style across the app: background, card, popover.
- Elevation should be achieved with borders and subtle background shifts, not heavy shadows.
- In dark mode, reduce or remove box shadows; use `border` and `bg` changes instead.

### 9. Motion and interactivity

- Motion should communicate state: hover, focus, active, loading, success, error.
- Keep transitions short: `150ms` to `250ms`.
- Use `ease-out` for UI feedback; avoid bounces or elastic effects in production tools.
- Respect `prefers-reduced-motion`: wrap decorative motion behind a media query or a reduced-motion hook.

### 10. Imagery and icons

- Never ship placeholder images. Generate or source final imagery.
- Use a single icon library (e.g. Lucide) and consistent sizing (`16px`, `20px`, `24px`).
- Icons should reinforce meaning, not replace labels for primary actions.

### 11. Anti-patterns to avoid

- Generic AI landing pages: floating gradient blobs, generic "three-column feature" sections, purple/indigo-on-white heroes.
- Hardcoded colors in component className strings.
- Mixed border radii within the same component family.
- Shadows darker than the content they elevate.
- Decorative motion that does not guide attention.
- More than one primary call-to-action in the same view.

## Tailwind + shadcn/ui specifics

- Define new tokens in `src/styles.css` inside `@theme inline` and set values in `:root` and `.dark`.
- When creating a new shadcn component variant, mirror the structure of existing variants (e.g. `variant="default" | "secondary" | "ghost"`).
- Use `ring` for focus states; do not invent new focus colors.
- Use `muted-foreground` for secondary text; never use opacity utilities like `text-black/60` for this purpose.
- Use `border` for dividers and card edges; use `input` for form field borders only.

## Decision guide

| If the user wants... | Then do... | Then avoid... |
| --- | --- | --- |
| "Clean" | Restrained palette, ample whitespace inside tight bounds, clear hierarchy | Decorative gradients, novelty fonts |
| "Modern" | Subtle motion, rounded corners, soft borders, semantic tokens | Skeuomorphism, heavy shadows, muted colors |
| "Professional" | Conservative type, high contrast, predictable spacing, accessible focus | Playful illustration, excessive color, animation |
| "Compact" | Tight padding, `gap-3`/`gap-4`, inline actions, visible density | Oversized cards, excessive whitespace, hidden actions |
| "Premium" | Deep neutrals, single accent, refined typography, considered empty states | Bright primaries, generic stock imagery, clutter |

## Final review

Before submitting, re-read the pre-build checklist. If more than two items are unchecked, fix them before finishing.
