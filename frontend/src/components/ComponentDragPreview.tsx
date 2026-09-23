import ComponentClassIcons from "./ComponentClassIcons.tsx";
import useTranslations from "../hooks/useTranslations.ts";
import { TGenericComponent } from "../lib/types.ts";

// Compact card that follows the pointer while dragging; stacked look + count
// when several components are dragged together.
export default function ComponentDragPreview({
  component,
  count,
}: {
  component: TGenericComponent | undefined;
  count: number;
}) {
  const translation = useTranslations().projectPage;
  if (!component) return null;

  return (
    <div className="relative w-72 cursor-grabbing">
      {count > 1 && (
        <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-lg border-2 border-fisma-blue bg-blue-50" />
      )}
      <div className="relative flex items-center gap-2 rounded-lg border-2 border-fisma-blue bg-white p-3 shadow-xl">
        <ComponentClassIcons
          componentClass={component.className}
          componentType={component.componentType}
        />
        <span className="truncate font-medium">{component.title || "—"}</span>
        {count > 1 && (
          <span className="ml-auto shrink-0 rounded-full bg-fisma-blue px-2 py-0.5 text-xs text-white">
            {count} {translation.componentsLabel}
          </span>
        )}
      </div>
    </div>
  );
}
