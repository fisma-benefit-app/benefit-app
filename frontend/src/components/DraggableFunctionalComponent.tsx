import { ComponentProps } from "react";
import { useDraggable } from "@dnd-kit/core";
import FunctionalClassComponent from "./FunctionalClassComponent.tsx";
import type { GapSide } from "../hooks/useComponentReorder.ts";

// Layout of the grid these cards sit in. Defined here, next to GAP_POSITION,
// because the drop line is positioned to sit exactly in this grid's gap:
// change the gap size or the xl column switch in both places.
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
// so cards stay put mid-drag), with the drop line drawn in the gap next to it.
export default function DraggableFunctionalComponent({
  dragDisabled,
  isBeingDragged,
  dropIndicator,
  registerCard,
  ...cardProps
}: ComponentProps<typeof FunctionalClassComponent> & {
  dragDisabled: boolean;
  isBeingDragged: boolean;
  dropIndicator: GapSide | null;
  registerCard: (componentId: number, el: HTMLDivElement | null) => void;
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
      {/* listeners go on the card's form only, not this wrapper: the card's
          modals render inside the wrapper and must not start a drag */}
      <FunctionalClassComponent {...cardProps} dragListeners={listeners} />
    </div>
  );
}
