# Admin Visual Editor Design

Date: 2026-04-10

## Goal

Build a visual desktop-focused admin editor for managing one product at a time. The editor should let an admin select a product, navigate chapters, manage ordered content blocks, and edit the selected item in a side panel without leaving the page.

This is not a full CMS. It is a focused internal editor for the infoproduct platform already in progress.

## Scope

V1 of the editor covers:

- Opening a product editor at `/admin/editor/[productId]`
- Viewing product summary and status
- Viewing and selecting chapters
- Creating chapters
- Viewing ordered blocks for the selected chapter
- Creating blocks by type
- Editing the selected block in a right-side properties panel
- Saving block changes
- Deleting blocks
- Reordering blocks with explicit move up / move down controls
- Reordering chapters with explicit move up / move down controls

Out of scope for this slice:

- Drag-and-drop sorting
- Mobile admin UX
- Rich media upload flows
- Live public preview
- Multi-user collaboration
- Autosave
- Advanced publishing workflows

## Layout

The editor uses a three-column desktop layout.

### Left Column

Purpose: product and chapter navigation.

Contains:

- Product title
- Product status
- Price summary
- Save / Preview actions
- Ordered chapter list
- New chapter button

Behavior:

- Selecting a chapter updates the center column and clears stale block selection if the selected block belongs to another chapter.
- Each chapter item shows title and block count.
- Reorder controls live on the chapter item, not in the side panel.

### Center Column

Purpose: ordered list of blocks for the selected chapter.

Contains:

- Current chapter heading
- New block button
- Visual cards for blocks in the chapter
- Lightweight chapter preview feel, but still clearly an admin interface

Behavior:

- Selecting a block loads its properties into the right panel.
- Block cards show type, title/summary, and order controls.
- Reorder uses explicit move up / move down actions.
- Empty chapter state should invite the admin to add the first block.

### Right Column

Purpose: editing the selected entity.

Primary use in V1:

- Edit selected block properties

Secondary use:

- If no block is selected, show contextual guidance or chapter-level details

Block editor examples:

- `rich_text`: title and content textarea
- `callout`: title, tone, body
- `checklist`: title and item list editor
- `download`: title, label, asset reference placeholder
- `audio` / `video`: title, URL
- `quiz`: title, question, answer list

## Routes

Required route:

- `/admin/editor/[productId]`

Supporting routes can stay in the existing admin area:

- `/admin`

The editor route should load the product and enough related data to render the initial UI. It does not need to preload every possible editor form variant beyond the selected chapter/block context.

## Data Loading

The editor needs:

- Product metadata
- Ordered chapters for the product
- Ordered blocks for each chapter, or at minimum for the selected chapter

Recommended approach for V1:

- Load product, chapters, and all blocks for the product in one server query flow
- Derive the selected chapter from `searchParams` or default to the first chapter
- Derive the selected block from `searchParams` or default to the first block in the selected chapter when present

This avoids overcomplicating the first version with client-side data orchestration.

## Interaction Model

### Selection

- Chapter selection is represented in the URL query string so refreshes preserve context.
- Block selection is also represented in the URL query string.

Example:

- `/admin/editor/product-guided-first-steps?chapter=chapter-intro&block=block-intro-rich-text`

### Persistence

V1 should use explicit save actions.

- Chapter create/update actions submit intentionally
- Block create/update actions submit intentionally
- Delete actions require confirmation

This is slower than autosave but much safer for the first editor version.

### Reordering

- Chapter reorder: move up / move down
- Block reorder: move up / move down

Each move operation updates `sortOrder` deterministically in the database.

Do not implement drag-and-drop in this slice.

## CRUD Surface

### Chapter Operations

- Create chapter
- Rename chapter
- Publish/unpublish chapter
- Move chapter up
- Move chapter down

### Block Operations

- Create block for selected chapter
- Edit block fields according to type
- Publish/unpublish block
- Duplicate block optional, not required
- Delete block
- Move block up
- Move block down

V1 requirement: create, update, delete, publish toggle, and reorder.

## Validation

Validation should follow the existing block schema rules already present in the codebase.

Examples:

- `rich_text` must have non-empty markdown
- `checklist` must have at least one item
- `quiz` must have at least two answers
- `audio` and `video` require valid URLs

Admin validation errors must appear inline in the right panel and should not silently fail.

## Error Handling

Expected error states:

- Product not found: show not found
- Product has no chapters: show guided empty state
- Selected chapter missing: fall back to first available chapter
- Selected block missing: clear block selection and show right-panel guidance
- Invalid block payload: show admin warning instead of crashing the page
- Save failure: show inline error message in the relevant panel

## UX Constraints

- Desktop-first only for this slice
- Clear distinction between navigation, structure, and editing
- No cramped modal-heavy flow
- Avoid sending the user to multiple disconnected pages for each tiny edit
- Preserve calm, production-like styling consistent with the rest of the admin

## Technical Direction

Recommended implementation shape:

- Server-rendered editor page
- Small focused server actions or route handlers for create/update/reorder/delete
- Reuse existing domain modules where possible
- Add a dedicated admin editor query module for product/chapter/block editing state
- Keep block-form logic modular so each type-specific editor stays small

## Phased Delivery

### Phase A

- Editor route
- Load product/chapters/blocks
- Chapter selection
- Block selection
- Read-only visual shell

### Phase B

- Create/update/delete chapter
- Create/update/delete block
- Right panel forms

### Phase C

- Move up/down ordering
- Publish toggles
- Empty/error states refinement

## Success Criteria

The slice is successful when an admin can:

1. Open a product editor
2. Select a chapter
3. Create a new block
4. Edit and save the block
5. Reorder blocks in the chapter
6. Create another chapter
7. Reorder chapters

