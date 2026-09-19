# Spec: Functional Component List — Search & Reposition

## Objective
Managing a project with many (50+) functional components is currently cumbersome: every
component renders as a full card in one long grid, with no way to search or quickly
reposition items — reaching or rearranging cards near the bottom means repeated
scrolling. This adds a live search box to narrow the grid to matching components, and
per-card move-to-top / move-to-bottom buttons so a user can bring components up without
dragging through the whole list.

Users: engineers filling in FiSMA/COSMIC functional component measurements on a project.

Success looks like: a user with 50+ components can type part of a name to narrow the
grid down to the ones they're after, then reposition each one to the top or bottom in
one click, instead of a long scroll-and-drag.

## Tech Stack
- Frontend only: React + TypeScript (existing `frontend/` app)
- Reorder: existing `@dnd-kit/core` / `@dnd-kit/sortable` (drag-and-drop stays as-is,
  unchanged)
- No new dependencies, no new components — search box follows the same text-input
  pattern already used in `ProjectList.tsx`
- No backend/API changes — same `orderPosition` field, same existing debounced
  `updateProject` auto-save (confirmed: this already sends all components' positions in
  one batched call, so move-to-top/bottom is a single cheap client-side recompute + save)

## Project Structure
No new files. Changes confined to:
```
frontend/src/components/ProjectPage.tsx           → search input + state, filters
                                                     `sortedComponents` before render
frontend/src/components/FunctionalClassComponent.tsx → move-to-top / move-to-bottom
                                                     buttons on each card
frontend/src/lib/fc-service-functions.ts          → helper to recompute orderPosition
                                                     for a single move-to-top/bottom
```

## Code Style
Match existing conventions in `ProjectPage.tsx` / `FunctionalClassComponent.tsx`:
functional components, `useState` for local state, Tailwind utility classes, UI text via
the existing `translation.*` object. Search input styled like `ProjectList.tsx`'s
existing project search box.

## Testing Strategy
The frontend has no test framework currently set up — no automated tests for this
feature. Verification is manual: exercise search filtering and move-to-top/bottom
against a project seeded with 50+ components in local dev before merging.

## Boundaries
- **Always do:** keep drag-and-drop reordering working exactly as today; preserve
  existing auto-save behavior; keep search non-destructive (filtered-out cards are
  hidden from render only, never removed from data)
- **Ask first:** any change to the `orderPosition` persistence mechanism or API
  contract; adding a new frontend dependency
- **Never do:** touch backend pagination/fetching (out of scope); pin/unpin; multi-select
  or bulk actions; multi-card group drag-and-drop (all explicitly deferred — see Open
  Questions)

## Success Criteria
- [x] A search box above the grid filters visible component cards by name as you type
- [x] Each card has "move to top" and "move to bottom" buttons that reorder it within
      the full component list (visible in Full View; hidden in Compact mode per
      post-implementation feedback — see amendment below)
- [x] Order changes from these buttons persist the same way existing drag-and-drop
      reordering does (same debounced auto-save)
- [x] Creating a new component clears any active search filter, so the new stub card is
      visible and the existing auto-scroll-to-bottom behavior still works unmodified
- [x] No new dependencies, no new modal, no new mode — search box is always present;
      move-to-top/bottom buttons reuse the existing Compact/Full View toggle rather than
      being unconditionally visible (amended from the original "always present" wording
      after real-world use showed 4 buttons per card was too crowded)

## Open Questions
None open — all prior open items resolved by cutting scope:
- Pin/unpin: dropped
- Group drag-and-drop: dropped
- Multi-select + bulk actions: dropped for v1 (search + per-card buttons cover the core
  pain point; revisit only if it turns out not to be enough in practice)
- Picker modal: dropped in favor of inline search (matches an existing pattern already
  in the codebase, avoids building new UI)

## Lifecycle
This spec lives in `docs/specs/` (not the repo root) and should be **deleted once the
implementing PR is merged** — git history and the PR description are the permanent
record; this file exists only to coordinate scope during planning and implementation.
