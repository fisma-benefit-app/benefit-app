import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { TGenericComponent } from "../lib/types.ts";
import { moveComponentsToIndex } from "../lib/fc-service-functions.ts";

export type GapSide = "before" | "after";

// Elements inside a card that keep their own click/drag behaviour: they
// don't start dragging the card.
const CARD_CONTROLS =
  "input, textarea, select, button, a, label, [contenteditable='true']";

// The whole card is the drag handle, except for its controls, so text can
// still be selected in inputs and buttons still click normally.
class CardPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: ({ nativeEvent: event }: ReactPointerEvent) =>
        event.isPrimary &&
        event.button === 0 &&
        !(event.target as Element).closest(CARD_CONTROLS),
    },
  ];
}

/**
 * Drag-to-reorder for the component grid, modelled on GitHub Projects: cards
 * don't reflow mid-drag; the drop position is computed from the pointer and
 * exposed as dropIndicatorFor() so the grid can draw a line in the gap.
 */
export default function useComponentReorder({
  sortedComponents,
  visibleComponents,
  onReorder,
}: {
  // full list in display order, and the part of it the search leaves visible
  sortedComponents: TGenericComponent[];
  visibleComponents: TGenericComponent[];
  onReorder: (reordered: TGenericComponent[]) => void;
}) {
  const sensors = useSensors(
    // small threshold so a click on a card doesn't start a drag
    useSensor(CardPointerSensor, { activationConstraint: { distance: 5 } }),
  );
  const [draggedIds, setDraggedIds] = useState<number[]>([]);
  const [dropTarget, setDropTarget] = useState<{
    id: number;
    side: GapSide;
  } | null>(null);
  const isDragging = draggedIds.length > 0;
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cardElements = useRef(new Map<number, HTMLDivElement>());

  const registerCard = (componentId: number, el: HTMLDivElement | null) => {
    if (el) {
      cardElements.current.set(componentId, el);
    } else {
      cardElements.current.delete(componentId);
    }
  };

  const insertIndexOf = (target: { id: number; side: GapSide }) =>
    sortedComponents.findIndex((c) => c.id === target.id) +
    (target.side === "after" ? 1 : 0);

  // nearest card to the pointer, and which half of it the pointer is on
  const updateDropTarget = (x: number, y: number) => {
    let nearest: { id: number; rect: DOMRect } | null = null;
    let nearestDistance = Infinity;
    for (const component of visibleComponents) {
      const rect = cardElements.current
        .get(component.id)
        ?.getBoundingClientRect();
      if (!rect) continue;
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = { id: component.id, rect };
      }
    }
    if (!nearest) return setDropTarget(null);

    // read the column count off the grid itself rather than duplicating its
    // responsive breakpoints here
    const multiColumn =
      gridRef.current !== null &&
      getComputedStyle(gridRef.current).gridTemplateColumns.split(" ").length >
        1;
    const { rect } = nearest;
    const side = (
      multiColumn
        ? x < rect.left + rect.width / 2
        : y < rect.top + rect.height / 2
    )
      ? "before"
      : "after";
    setDropTarget({ id: nearest.id, side });
  };
  const updateDropTargetRef = useRef(updateDropTarget);
  updateDropTargetRef.current = updateDropTarget;

  // follow the real pointer (dnd-kit's delta drifts once the page scrolls)
  useEffect(() => {
    if (!isDragging) return;
    let last: { x: number; y: number } | null = null;
    const handlePointerMove = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY };
      updateDropTargetRef.current(last.x, last.y);
    };
    const handleScroll = () => {
      if (last) updateDropTargetRef.current(last.x, last.y);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isDragging]);

  // no line (and no move) where dropping wouldn't change the order
  const dropWouldMove =
    isDragging &&
    dropTarget !== null &&
    moveComponentsToIndex(
      sortedComponents,
      new Set(draggedIds),
      insertIndexOf(dropTarget),
    ).some((c, idx) => c.id !== sortedComponents[idx].id);

  const onDragStart = (event: DragStartEvent) => {
    const componentId = Number(event.active.id);
    if (!Number.isFinite(componentId)) return;
    setDraggedIds([componentId]);
    const activator = event.activatorEvent;
    if (activator instanceof MouseEvent) {
      updateDropTarget(activator.clientX, activator.clientY);
    }
  };

  const onDragCancel = () => {
    setDraggedIds([]);
    setDropTarget(null);
  };

  const onDragEnd = () => {
    if (dropTarget && dropWouldMove) {
      onReorder(
        moveComponentsToIndex(
          sortedComponents,
          new Set(draggedIds),
          insertIndexOf(dropTarget),
        ),
      );
    }
    onDragCancel();
  };

  return {
    dndContextProps: { sensors, onDragStart, onDragEnd, onDragCancel },
    gridRef,
    registerCard,
    draggedIds,
    isDragging,
    dropIndicatorFor: (componentId: number): GapSide | null =>
      dropWouldMove && dropTarget?.id === componentId ? dropTarget.side : null,
  };
}
