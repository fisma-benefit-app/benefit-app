import ComponentClassIcons from "./ComponentClassIcons.tsx";
import { TGenericComponent } from "../lib/types.ts";

// Compact card that follows the pointer while dragging.
export default function ComponentDragPreview({
  component,
}: {
  component: TGenericComponent | undefined;
}) {
  if (!component) return null;

  return (
    <div className="relative w-72 cursor-grabbing">
      <div className="relative flex items-center gap-2 rounded-lg border-2 border-fisma-blue bg-white p-3 shadow-xl">
        <ComponentClassIcons
          componentClass={component.className}
          componentType={component.componentType}
        />
        <span className="truncate font-medium">{component.title || "—"}</span>
      </div>
    </div>
  );
}
