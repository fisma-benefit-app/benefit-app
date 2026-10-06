import { ReactNode, useLayoutEffect, useMemo, useRef } from "react";
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

  const columns = useMemo(() => {
    const nextColumns = Array.from(
      { length: columnCount },
      () => [] as number[],
    );

    items.forEach((_, index) => {
      // Keep the source order stable. Rebalancing based on measured card
      // heights makes cards appear to be sorted again whenever their width
      // changes during a panel toggle.
      const columnIndex = index % columnCount;
      nextColumns[columnIndex].push(index);
    });

    return nextColumns;
  }, [columnCount, items]);

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
  }, [columnCount, columns, gridRef]);

  return (
    <div
      ref={gridRef}
      data-column-count={columnCount}
      className="grid w-full gap-5"
      style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
    >
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex min-w-0 flex-col gap-5">
          {column.map((itemIndex) => (
            <div
              key={items[itemIndex].id}
              data-masonry-item={items[itemIndex].id}
              className="min-w-0 w-full"
            >
              {renderItem(items[itemIndex], itemIndex)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
