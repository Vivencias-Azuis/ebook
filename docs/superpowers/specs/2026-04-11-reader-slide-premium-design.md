# Reader Slide Premium Design

## Context

The current reader experience at `src/app/products/[slug]/read/page.tsx` already supports gated access, progress tracking, checklists, and pagination. It is functional, but it still feels closer to an application page than to a reading experience that pulls the user forward.

The user's feedback is specific:

- the interface feels unintuitive
- it does not create desire to keep reading
- the reading experience should behave more like slides
- the main experience should avoid vertical scrolling
- long content should be split across multiple pages instead of being compressed to fit one screen

This is not a request for a minor visual polish. It is a change in reading mode: from a scrolling content surface to a staged, page-by-page presentation flow.

## Goal

Redesign the reader into a premium slide-based experience where:

- the user reads one screen at a time
- the main content area does not rely on vertical scrolling
- long blocks are split into multiple sequential slides
- navigation is cleaner and more obvious
- the overall atmosphere feels premium, focused, and more desirable to read

Success means:

- the next action is always obvious
- the reader feels more like a premium presentation than a document page
- the experience increases reading momentum instead of feeling dense or static
- existing product access and progress behavior remain intact

## Non-Goals

- changing authentication or entitlement rules
- changing the publishing model for chapters and blocks
- creating a second independent reader route
- introducing a separate progress system for slides
- rewriting course copy as part of this pass

## Chosen Direction

Recommended direction: `premium slide reader`.

This direction combines:

- one-screen-at-a-time presentation
- stronger visual atmosphere with deep navy and blue framing
- restrained but obvious navigation
- content-first layout inside a cinematic shell
- automatic splitting of long content into multiple reader steps

This direction was chosen over:

- keeping the current reader shell and only changing visuals, which would not address the user's core complaint about reading mode
- creating a parallel slide mode, which would duplicate logic and increase maintenance cost
- a more didactic guided-classroom style, which improves clarity but loses some of the premium, desirable feel the user preferred

## Experience Principles

### One Stage At A Time

The user should see one meaningful step per screen. The current screen is the whole point of attention, not one section inside a longer scroll.

### Momentum Over Density

The interface should encourage advancing. Each screen should feel complete enough to consume quickly while naturally pulling the user to the next step.

### Premium, Not Noisy

The shell can carry visual drama through gradient, contrast, and strong typography, but the reading surface itself must remain legible and calm.

### Navigation Without Friction

The user should not need to interpret the interface before using it. Previous, next, current step, and progress should all be visible with minimal effort.

## UX Structure

### Reader Model

The reader becomes a sequence of slides.

- a short block maps to one slide
- a long block maps to multiple slides
- each generated slide remains part of the same reader flow
- chapter and block identity are preserved underneath so progress logic can stay anchored to the original content structure

The system should prefer splitting long content into smaller steps rather than shrinking text or allowing the main experience to scroll.

### Top Bar

The header becomes minimal and directional:

- product identity
- current step position
- overall progress
- a clear path back to the library

It should feel integrated into the premium shell rather than like a row of utility chips.

### Main Slide Surface

The main viewport is treated like a stage:

- near-full-height composition
- centered content area
- strong title hierarchy
- generous spacing
- controlled reading width

This is the primary focus of the page.

### Navigation Controls

Navigation should be explicit and effortless:

- previous and next controls always available when applicable
- current position clearly visible
- keyboard-friendly navigation where practical
- mobile-friendly controls with comfortable hit targets

The controls should feel premium and integrated, not like detached utility buttons.

### Sumario

The table of contents remains useful, but becomes secondary:

- visually quieter than the slide surface
- easier to collapse or treat as supporting navigation
- still usable for orientation and jumping across content

It should help the user understand where they are without competing with the current slide.

## Visual Direction

### Overall Atmosphere

The chosen visual style is `premium puro`.

That means:

- deeper navy and blue gradients framing the experience
- stronger contrast between shell and reading surface
- larger, more dramatic headings
- fewer simultaneous UI elements on screen
- a more cinematic feeling than the current app-like reader

### Balance For Readability

The premium shell should not make the reading content harder to consume.

To avoid fatigue:

- the content panel stays highly legible
- long-form text uses controlled width and generous line spacing
- high drama is concentrated in chapter openings, transitions, and surrounding chrome
- text-heavy slides remain calmer inside the frame

### Slide Types

The visual system should support a small set of recognizable slide patterns:

- chapter opening
- text reading slide
- highlight / key idea slide
- checklist / action slide
- completion or next-step slide

These patterns should feel related, not like separate mini-products.

## Content Fragmentation Strategy

The most important behavioral change is how content is split.

The reader already builds page units from chapters and blocks. That page-building layer should be extended so a single block can produce multiple reader slides when necessary.

Expected behavior:

- short paragraphs stay together
- long rich-text content is split into multiple readable segments
- checklist blocks generally stay intact unless there is a strong reason to split them
- slide boundaries should feel intentional, not arbitrary mid-thought breaks

This keeps the no-scroll requirement without damaging readability.

## Component Scope

Primary implementation targets:

- `src/app/products/[slug]/read/page.tsx`
- `src/features/reader/pagination.ts`
- `src/features/reader/reader-sidebar.tsx`

Likely supporting style changes:

- `src/app/globals.css`

Possibly touched, depending on rendering needs:

- `src/features/reader/block-renderer.tsx`

The current access, content, and progress domain files should remain largely intact.

## Technical Approach

### Preserve Existing Domain Logic

Keep these areas as they are unless a small adaptation is strictly required:

- authentication
- entitlement checks
- published content lookup
- block completion mutations
- checklist progress mutations
- progress summaries used by the library and reader

### Extend Reader Pagination

`buildReaderPages` is the correct seam for this redesign.

It should evolve from a simple block-to-page mapper into a block-to-slide mapper that can:

- keep metadata tied to chapter and source block
- generate subslides for long content
- expose enough information for the UI to show slide counts and navigation cleanly

This is the smallest structural change that actually supports the desired experience.

### Preserve Progress Semantics

Progress should continue to be based on the existing block model, not on a brand-new slide model.

That means:

- a block can span several slides visually
- completion still anchors to the block itself
- the library progress summaries do not need a second layer of logic

This avoids inflating complexity for little user benefit.

## Error States And Edge Cases

### Empty Content

If there are no published pages, the reader should continue showing a clear empty state.

### Very Long Blocks

If a block is too long for one screen, it should be broken into multiple slides instead of relying on scrolling.

### Blocks That Resist Splitting

If a block type cannot be safely fragmented, it should render as a single purpose-built slide layout rather than being split poorly.

### Mobile

The mobile experience should remain paginated and focused. The absence of a fixed sidebar should not reduce clarity. Navigation and progress must stay obvious without depending on desktop layout.

## Testing Strategy

Validation should focus on behavior preservation plus the new reading mode.

Automated checks should cover:

- reader pagination behavior
- sidebar behavior
- any tests affected by the page-building model

Relevant existing tests include:

- `tests/reader-pagination.test.ts`
- `tests/reader-sidebar.test.tsx`
- `tests/product-read-page.test.tsx`

Manual validation should cover:

- desktop reading flow across multiple chapters
- mobile reading flow and navigation clarity
- long content splitting across multiple slides
- checklist rendering and saving
- perceived reading comfort and visual desirability

## Risks

### Over-Stylization

If every slide is treated like a dramatic hero section, the reader may become tiring.

Mitigation:

- concentrate visual intensity in shell and transitions
- keep text slides calmer and more editorial inside the stage

### Awkward Content Splits

If slide fragmentation is naive, the content may feel chopped apart.

Mitigation:

- split on meaningful content boundaries
- keep fragmentation rules narrow and predictable
- test with real long-form content, not only synthetic examples

### Progress Confusion

If the UI starts emphasizing slides too much, users may assume progress is tracked per slide rather than per content block.

Mitigation:

- keep progress messaging tied to the broader reading journey
- avoid exposing unnecessary internal distinctions between slide and block

## Recommendation

Proceed with a reader redesign centered on:

- premium slide-based reading
- no vertical scrolling in the main experience
- automatic multi-slide splitting for long content
- cleaner navigation and reduced UI noise
- reuse of existing access and progress foundations

This is the smallest meaningful redesign that directly addresses the user's complaint that the current interface is not intuitive and does not create desire to keep reading.
