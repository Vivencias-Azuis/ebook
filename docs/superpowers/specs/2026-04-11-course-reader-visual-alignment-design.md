# Course Reader Visual Alignment Design

## Context

The public landing pages already use a consistent editorial visual language:

- deep blue gradients and accents
- off-white backgrounds
- solid rounded panels with soft borders
- serif headings paired with a clean sans font

The course reading area at `src/app/products/[slug]/read/page.tsx` currently diverges from that language. It leans on translucent glassmorphism, floating surfaces, and a softer beige atmosphere that feels like a separate product experience.

The user's goal is not to redesign the reader flow. The goal is to make the course area visually belong to the same brand system as the landing page, with emphasis on overall atmosphere rather than navigation or interaction changes.

## Goal

Align the course reader with the landing page through a more sober editorial treatment that preserves reading comfort.

Success means:

- the reader feels like part of the same product family as the landing
- the visual atmosphere matches the landing more closely than it does today
- the experience remains calmer and more utilitarian than the marketing page
- no changes are made to reader pagination, access flow, or content structure

## Non-Goals

- changing reader information architecture
- changing block rendering behavior
- changing progress logic or page navigation behavior
- adding animations, new interactions, or new product features
- reworking copy

## Chosen Direction

Recommended direction: `editorial sobrio`.

This keeps the same core visual DNA as the landing page, but adapts it for sustained reading:

- fewer translucent layers
- more solid, stable surfaces
- cleaner contrast between background, navigation, and content
- stronger editorial hierarchy for titles
- more restrained supporting UI so the page content stays primary

This direction was chosen over:

- a direct landing-page clone, which would risk making the reader feel too promotional
- a neutral utility reader, which would improve usability but preserve the feeling that the course area belongs to a different interface system

## Experience Principles

### Shared Brand Family

The reader should clearly reuse the landing page's visual system:

- the same blue/off-white palette
- the same rounded geometry language
- the same serif/sans pairing
- the same soft-border, premium-card construction

### Reading First

The main reading surface must feel quieter than the landing page:

- fewer background effects
- less translucency
- less floating-card fragmentation
- clearer typography hierarchy

### Balanced Navigation

The sidebar should remain visually intentional but not compete with the content. It should feel designed, not decorative.

## Visual Design Changes

### Page Background

Replace the current glassy, multi-layered atmospheric background with a cleaner page field derived from the landing system:

- off-white or paper-like base
- optional subtle blue cast or restrained radial treatment
- reduced emphasis on shimmer, blur, or frosted effects

The page background should support the composition instead of becoming a visual feature.

### Header

Rework the top header into a more editorial top bar:

- solid or near-solid surface
- cleaner border treatment
- reduced blur/transparency
- stronger integration with the rest of the page chrome

The “Biblioteca” back link and progress chips should remain in place, but they should look like part of the same design language as the landing rather than lightweight floating pills.

### Sidebar / Table of Contents

Adjust the sidebar to feel like a structured editorial index:

- solid light panel instead of translucent glass
- tighter and more consistent border/shadow treatment
- clearer section heading and product title hierarchy
- progress bar visually aligned with landing accent colors
- page links styled as structured index rows rather than soft floating pills

Active and completed states should remain easy to scan, but the visual treatment should be calmer and more architectural.

### Reader Surface

The main article container should become the strongest surface on the page:

- solid light background with premium-paper feel
- subtle border and contained shadow
- reduced overlay effects and decorative glow
- stronger chapter title presentation using the existing serif display language

The current title block should be adjusted to feel more like the landing's editorial headlines and less like an application card header.

### Footer Navigation

The bottom previous/next navigation should feel integrated with the reader shell:

- visually connected to the same surface system
- less like a separate floating toolbar
- consistent primary/secondary button styling with the landing palette

### Checklist / Action Areas

Checklist and completion controls should use the same solid-card language:

- lighter, more stable card surfaces
- stronger navy/blue accents for calls to action
- inputs and labels that feel part of the same premium editorial system

These sections can stand out, but should do so through contrast and structure rather than translucency.

## Component Scope

Primary implementation target:

- `src/app/products/[slug]/read/page.tsx`

Supporting style adjustments may be added to:

- `src/app/globals.css`

No expected structural changes are required in:

- `src/features/reader/block-renderer.tsx`
- reader pagination or progress domain files

## Implementation Notes

- Reuse existing design tokens in `globals.css` where possible.
- Prefer introducing a small set of shared reader-specific utility classes over scattering one-off long class strings if the page becomes easier to maintain that way.
- Keep responsive behavior equivalent to the current implementation.
- Preserve accessibility affordances, especially contrast, focus states, and readable tap targets.

## Testing Strategy

Validation should focus on regression safety, not behavior expansion:

- run existing reader and landing tests
- verify the course reader still renders navigation and progress states correctly
- manually verify desktop and mobile layout balance
- manually verify that the reader now feels visually closer to the landing page

Relevant checks:

- `tests/marketing-landing.test.tsx`
- `tests/reader-pagination.test.ts`
- any tests touching reader rendering if visual refactors require small markup adjustments

## Risks

### Over-Correction

If the reader copies the landing too literally, it may feel like a sales page instead of a reading environment.

Mitigation:

- keep the palette and typography
- reduce promotional contrast
- simplify background and supporting chrome

### Visual Fragmentation

If only one area is updated, the page may still feel inconsistent.

Mitigation:

- update header, sidebar, reader shell, footer navigation, and checklist treatment as one coherent pass

### Readability Regression

If contrast or density is pushed too far, long-form reading quality could drop.

Mitigation:

- keep content as the visual priority
- use decorative effects sparingly
- test the main reading column on desktop and mobile
