# Plan: Functional Component List — Search & Reposition

Implements `docs/specs/SPEC-component-list-search-reposition.md`.

## Components & Dependencies

1. **`frontend/src/lib/fc-service-functions.ts`** — new pure helper(s):
   `moveComponentToTop(components, componentId)` and
   `moveComponentToBottom(components, componentId)`. Take the full component array,
   return a new array with `orderPosition` recomputed (0..n-1), preserving the relative
   order of everything else. No dependency on anything else being built — this is the
   foundation everything else calls.

2. **`frontend/src/components/ProjectPage.tsx`**:
   - `searchQuery` state + a derived filtered list for rendering
     (`sortedComponents.filter(...)` by `title`, case-insensitive).
   - `handleMoveToTop` / `handleMoveToBottom`: call the (1) helpers against the full
     (unfiltered) component list, update state, call the existing `debouncedSaveProject()`
     — same trigger `handleDragEnd` already uses, so persistence is free.
   - Pass the two handlers down to each `FunctionalClassComponent` as props.
   - In `handleCreateFunctionalComponent`, clear `searchQuery` so the new stub is
     visible and the existing auto-scroll-to-bottom (`bottomRef`) still works unmodified.
   - Depends on (1) existing.

3. **`frontend/src/components/FunctionalClassComponent.tsx`**:
   - Two buttons ("move to top" / "move to bottom") per card, calling the props passed
     down from (2).
   - Depends on (2)'s handlers being wired as props.

## Build Order

1. `fc-service-functions.ts` helpers, sanity-checked in isolation (feed a small array,
   confirm reindexing is correct) — nothing else can be meaningfully tested without this.
2. `ProjectPage.tsx` move handlers + wiring — depends on (1).
3. `FunctionalClassComponent.tsx` buttons — depends on (2)'s props existing.
4. `ProjectPage.tsx` search input + filtering + create-clears-search — logically
   separable from 2–3 (could be its own PR for smaller review units), but touches the
   same file and overlapping render logic (the `sortedComponents`/`SortableContext`
   area), so treat as sequential, not truly parallel work — doing both at once risks
   self-inflicted merge conflicts, not a real speedup.

## Risks & Mitigations

- **Search filter vs. drag-and-drop (`SortableContext`)**: verified by reading
  `handleDragEnd` (ProjectPage.tsx:725-751) directly — it resolves `oldIndex`/`newIndex`
  by matching `active.id`/`over.id` against a full `orderPosition`-sorted array of *all*
  components, not by rendered array position. Since `over.id` can only ever be an id of
  a currently-rendered item, dragging within a filtered subset already reorders
  correctly against the full list with no logic changes. The only concrete follow-up:
  `SortableContext`'s `items` prop must be updated to the filtered id list when a search
  is active, so dnd-kit knows which items are actually draggable/droppable. Not an open
  risk — a one-line wiring detail for task 4.
- **Card layout crowding**: `FunctionalClassComponent.tsx` cards are already dense
  (683 lines, existing compact-mode toggle). Two new buttons need placement that doesn't
  clutter compact mode. Cosmetic risk only — verify visually in dev, no architectural
  impact.
- **Everything else** is low-risk: no backend touched, no new dependency, persistence
  reuses an already-working path.

## Verification Checkpoints

1. After step 1: confirm the helper reindexes correctly by hand (move-to-top of item at
   index k puts it at 0, shifts 0..k-1 down by one, leaves k+1..n-1 untouched; mirror for
   bottom).
2. After steps 2–3: in local dev, seed/open a project with 50+ components; click
   move-to-top/bottom on a card, confirm it persists after a page reload.
3. After step 4: confirm typing in the search box narrows the grid correctly; confirm
   creating a new component while filtered clears the filter and reveals + scrolls to
   the new stub as before.
4. Final pass: walk the spec's Success Criteria checklist end to end before opening the
   PR.

## Note on file location
Saved under `docs/specs/` (not the skill's default `tasks/plan.md` at repo root) to stay
consistent with keeping AI-workflow artifacts out of the project root. Flagging this
explicitly: if you use `/build` or another skill that expects `tasks/plan.md` /
`tasks/todo.md` at their default paths, tell me and I'll either move this there or point
that command at this path instead.
