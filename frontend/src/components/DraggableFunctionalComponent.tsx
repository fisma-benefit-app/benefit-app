import { ComponentProps } from "react";
import { useDraggable } from "@dnd-kit/core";
import FunctionalClassComponent from "./FunctionalClassComponent.tsx";
import useTranslations from "../hooks/useTranslations.ts";
import type { GapSide } from "../hooks/useComponentReorder.ts";

// Layout of the grid these cards sit in. Defined here, next to GAP_POSITION,
// because the gap bars and drop line are positioned to sit exactly in this
// grid's gap: change the gap size or the xl column switch in both places.
export const COMPONENT_GRID_CLASSES =
  "grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4";

// Where the gap next to a card is: above/below in the single-column layout,
// left/right once the grid goes multi-column (xl). Sized to the gap-4 above.
const GAP_POSITION: Record<GapSide, string> = {
  before:
    "inset-x-0 -top-4 h-4 xl:inset-x-auto xl:inset-y-0 xl:-left-4 xl:h-auto xl:w-4",
  after:
    "inset-x-0 -bottom-4 h-4 xl:inset-x-auto xl:inset-y-0 xl:-right-4 xl:h-auto xl:w-4",
};

// Clickable bar in the gap next to a card; moves the selected components
// to `insertIndex`.
function PlacementSlot({
  side,
  insertIndex,
  onPlace,
}: {
  side: GapSide;
  insertIndex: number;
  onPlace: (insertIndex: number) => void;
}) {
  const label = useTranslations().projectPage.moveSelectedHere;
  return (
    <button
      type="button"
      onClick={() => onPlace(insertIndex)}
      title={label}
      aria-label={label}
      className={`group absolute z-10 flex items-center justify-center cursor-pointer ${GAP_POSITION[side]}`}
    >
      <span className="block rounded-full bg-fisma-blue/40 transition-all h-1 w-full group-hover:h-2 group-hover:bg-fisma-blue group-focus-visible:h-2 group-focus-visible:bg-fisma-blue xl:h-full xl:w-1 xl:group-hover:h-full xl:group-hover:w-2 xl:group-focus-visible:h-full xl:group-focus-visible:w-2" />
    </button>
  );
}

// Line showing where the dragged components will land on drop.
function DropIndicator({ side }: { side: GapSide }) {
  return (
    <div
      className={`pointer-events-none absolute z-10 flex items-center justify-center ${GAP_POSITION[side]}`}
    >
      <span className="block rounded-full bg-fisma-blue h-1 w-full xl:h-full xl:w-1" />
    </div>
  );
}

// A component card in the project grid: draggable by its body (not sortable,
// so cards stay put mid-drag), with the gap bar / drop line drawn around it.
export default function DraggableFunctionalComponent({
  dragDisabled,
  isBeingDragged,
  dropIndicator,
  registerCard,
  placementSlots,
  onPlace,
  ...cardProps
}: ComponentProps<typeof FunctionalClassComponent> & {
  dragDisabled: boolean;
  isBeingDragged: boolean;
  dropIndicator: GapSide | null;
  registerCard: (componentId: number, el: HTMLDivElement | null) => void;
  // insert indexes for the gap bars before / after this card; null = no bar
  placementSlots: { before: number | null; after: number | null };
  onPlace: (insertIndex: number) => void;
}) {
  const componentId = cardProps.component.id;
  const { listeners, setNodeRef } = useDraggable({
    id: componentId,
    disabled: dragDisabled,
  });

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        registerCard(componentId, el);
      }}
      className={`relative transition-opacity ${isBeingDragged ? "opacity-40" : ""}`}
    >
      {dropIndicator && <DropIndicator side={dropIndicator} />}
      {placementSlots.before !== null && (
        <PlacementSlot
          side="before"
          insertIndex={placementSlots.before}
          onPlace={onPlace}
        />
      )}
      {placementSlots.after !== null && (
        <PlacementSlot
          side="after"
          insertIndex={placementSlots.after}
          onPlace={onPlace}
        />
      )}
      {/* listeners go on the card's form only, not this wrapper: the card's
          modals render inside the wrapper and must not start a drag */}
      <FunctionalClassComponent {...cardProps} dragListeners={listeners} />
    </div>
  );
}
