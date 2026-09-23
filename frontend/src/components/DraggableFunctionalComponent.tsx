import { ComponentProps } from "react";
import { useDraggable } from "@dnd-kit/core";
import FunctionalClassComponent from "./FunctionalClassComponent.tsx";
import type { GapSide } from "../hooks/useComponentReorder.ts";

// Where the gap next to a card is: above/below in the single-column layout,
// left/right once the grid goes multi-column (xl). Sized to the grid's gap-4,
// so keep in sync with the grid classes in ProjectPage.
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

// A component card in the project grid: draggable (not sortable, so cards
// stay put mid-drag), with the drop line drawn in the gap next to it.
export default function DraggableFunctionalComponent({
  isBeingDragged,
  dropIndicator,
  registerCard,
  ...cardProps
}: ComponentProps<typeof FunctionalClassComponent> & {
  isBeingDragged: boolean;
  dropIndicator: GapSide | null;
  registerCard: (componentId: number, el: HTMLDivElement | null) => void;
}) {
  const componentId = cardProps.component.id;
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: componentId,
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
      <FunctionalClassComponent
        {...cardProps}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
