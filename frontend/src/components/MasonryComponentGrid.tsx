import { ReactNode, useLayoutEffect, useRef } from "react";
import type { TGenericComponent } from "../lib/types.ts";

type MasonryComponentGridProps = {
  items: TGenericComponent[];
  columnCount: number;
  gridRef: React.MutableRefObject<HTMLDivElement | null>;
  renderItem: (item: TGenericComponent, index: number) => ReactNode;
};

export default function MasonryComponentGrid({
  items,
  columnCount,
  gridRef,
  renderItem,
}: MasonryComponentGridProps) {
  const previousItemRects = useRef<Map<number, DOMRect>>(new Map());
  const previousColumnCount = useRef(columnCount);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const elements = Array.from(
      grid.querySelectorAll<HTMLElement>("[data-masonry-item]"),
    );
    const currentItemRects = new Map<number, DOMRect>(
      elements.map((element): [number, DOMRect] => [
        Number(element.dataset.masonryItem),
        element.getBoundingClientRect(),
      ]),
    );

    const shouldAnimate =
      previousItemRects.current.size > 0 &&
      previousColumnCount.current !== columnCount &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (shouldAnimate && typeof Element.prototype.animate === "function") {
      elements.forEach((element) => {
        const itemId = Number(element.dataset.masonryItem);
        const previousRect = previousItemRects.current.get(itemId);
        const currentRect = currentItemRects.get(itemId);
        if (!previousRect || !currentRect) return;

        element.getAnimations().forEach((animation) => animation.cancel());
        element.animate(
          [
            {
              transform: `translate(${previousRect.left - currentRect.left}px, ${
                previousRect.top - currentRect.top
              }px)`,
            },
            { transform: "translate(0, 0)" },
          ],
          {
            duration: 280,
            easing: "ease-out",
          },
        );
      });
    }

    previousItemRects.current = currentItemRects;
    previousColumnCount.current = columnCount;
  }, [columnCount, items, gridRef]);

  // Cards are placed straight into the grid, row by row, so every card in a
  // row starts at the same height. A tall card (e.g. one with the MLA box
  // open) makes its row taller and leaves empty space next to it, instead of
  // pushing only its own column down and offsetting the rows (#1063).
  return (
    <div
      ref={gridRef}
      data-column-count={columnCount}
      className="grid w-full items-start gap-5"
      style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          data-masonry-item={item.id}
          className="min-w-0 w-full"
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
