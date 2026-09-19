# Tasks: Functional Component List — Search & Reposition

Implements `docs/specs/PLAN-component-list-search-reposition.md`. Ordered by
dependency — do not start a task before the ones above it are done.

- [x] **Task 1: Add reorder helpers**
  - Description: Add `moveComponentToTop(components, componentId)` and
    `moveComponentToBottom(components, componentId)` — pure functions that take the
    full component array and a target id, return a **new** array with `orderPosition`
    recomputed for every item (0..n-1), preserving the relative order of everything
    else.
  - Acceptance: `moveComponentToTop` places the target at position 0, shifting
    everything before it down by one; `moveComponentToBottom` places it at position
    n-1, shifting everything after it up by one; the rest of the array's relative
    order is unchanged; input array is not mutated.
  - Verify: Manual — feed a small mock array in a scratch script or browser console,
    confirm output ordering matches expectation. No automated tests (no test framework
    in this repo).
  - Files: `frontend/src/lib/fc-service-functions.ts`

- [x] **Task 2: Wire move handlers into ProjectPage state**
  - Description: Add `handleMoveToTop(componentId)` / `handleMoveToBottom(componentId)`
    to `ProjectPage.tsx`, calling the Task 1 helpers against the full
    `project.functionalComponents`, updating state via `setProject`, and triggering
    `debouncedSaveProject()` — the same persistence path `handleDragEnd` already uses.
    Pass both handlers down as props to each rendered `FunctionalClassComponent`.
  - Acceptance: Invoking either handler updates component order in state and fires the
    existing debounced auto-save; both handlers reach `FunctionalClassComponent` as
    props (no UI trigger yet — that's Task 3).
  - Verify: Manual — temporarily call a handler from the browser console or a throwaway
    button, confirm state updates and the auto-save network call fires with the
    expected `orderPosition` values.
  - Files: `frontend/src/components/ProjectPage.tsx`

- [x] **Task 3: Add move-to-top / move-to-bottom buttons**
  - Description: Add two buttons per card in `FunctionalClassComponent.tsx`, calling
    the Task 2 props with that card's component id. Fit them into both compact and
    expanded card layouts without crowding existing controls.
  - Acceptance: Each card shows both buttons; clicking one moves that component to the
    top/bottom of the full list and the change persists after a page reload; layout
    holds up in both compact mode and normal mode.
  - Verify: Manual — in local dev with a project seeded to 50+ components, click
    move-to-top/bottom on cards at various positions, confirm correct placement and
    persistence after reload.
  - Files: `frontend/src/components/FunctionalClassComponent.tsx`

- [x] **Task 4: Add search filtering** (implemented; needs manual browser verification per its Verify step — no browser tool available in this session)
  - Description: Add a search input above the grid in `ProjectPage.tsx` with
    `searchQuery` state; derive a filtered list (case-insensitive match on `title`)
    used both for rendering and as `SortableContext`'s `items` prop (so dnd-kit only
    treats currently-visible cards as draggable/droppable — confirmed safe per the
    plan's read of `handleDragEnd`, no other drag logic changes needed). Update
    `handleCreateFunctionalComponent` to clear `searchQuery` before creating, so the
    new stub is visible and the existing auto-scroll-to-bottom (`bottomRef`) still
    works unmodified.
  - Acceptance: typing narrows the grid to name matches only; dragging a card while
    filtered still repositions it correctly against the full list (verify by clearing
    the filter afterward and checking placement); creating a new component while
    filtered clears the filter and the new stub is visible + scrolled to; clearing the
    search box restores the full grid.
  - Verify: Manual — in local dev: (a) type partial names, confirm filtering; (b) drag
    a card while filtered, clear filter, confirm it landed in the correct real
    position; (c) create a new component while filtered, confirm filter clears and new
    stub is visible+scrolled to as before.
  - Files: `frontend/src/components/ProjectPage.tsx`

- [x] **Task 5: Final pass against spec**
  - Description: No code — walk every item in
    `docs/specs/SPEC-component-list-search-reposition.md`'s Success Criteria checklist
    end to end in local dev before opening the PR.
  - Acceptance: every Success Criteria box in the spec can be checked off truthfully.
  - Verify: manual walkthrough, seeded 50+ component project.
  - Files: none
