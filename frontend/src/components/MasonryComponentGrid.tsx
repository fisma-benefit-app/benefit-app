import { ReactNode, useEffect, useMemo, useState } from "react";
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
  const [itemHeights, setItemHeights] = useState<Record<number, number>>({});

  useEffect(() => {
    setItemHeights((current) => {
      const itemIds = new Set(items.map((item) => item.id));
      return Object.fromEntries(
        Object.entries(current).filter(([id]) => itemIds.has(Number(id))),
      );
    });
  }, [items]);

  const columns = useMemo(() => {
    const nextColumns = Array.from(
      { length: columnCount },
      () => [] as number[],
    );
    const heights = Array.from({ length: columnCount }, () => 0);

    items.forEach((item, index) => {
      const columnIndex =
        index < columnCount ? index : heights.indexOf(Math.min(...heights));
      nextColumns[columnIndex].push(index);
      heights[columnIndex] += itemHeights[item.id] ?? 0;
    });

    return nextColumns;
  }, [columnCount, itemHeights, items]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined" || !gridRef.current) return;

    const observer = new ResizeObserver((entries) => {
      setItemHeights((current) => {
        const next = { ...current };
        let changed = false;

        entries.forEach((entry) => {
          const id = Number((entry.target as HTMLElement).dataset.masonryItem);
          const height = Math.round(entry.contentRect.height);
          if (next[id] !== height) {
            next[id] = height;
            changed = true;
          }
        });

        return changed ? next : current;
      });
    });

    gridRef.current
      .querySelectorAll<HTMLElement>("[data-masonry-item]")
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [columns, gridRef]);

  return (
    <div
      ref={gridRef}
      data-column-count={columnCount}
      className="grid w-full gap-5 transition-all duration-300"
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
