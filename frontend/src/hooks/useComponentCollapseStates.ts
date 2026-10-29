import { useEffect, useState } from "react";

// Per-component collapsed state, kept so that components don't collapse again while
// auto-save refreshes the project. Components without their own state follow collapseAll,
// except the one just added, which starts expanded.
export default function useComponentCollapseStates(
  collapseAll: boolean,
  lastAddedComponentId: number | null,
) {
  const [componentCollapseStates, setComponentCollapseStates] = useState<
    Map<number, boolean>
  >(new Map());

  const updateComponentCollapseState = (
    componentId: number,
    collapsed: boolean,
  ) => {
    setComponentCollapseStates((prev) => {
      const newMap = new Map(prev);
      newMap.set(componentId, collapsed);
      return newMap;
    });
  };

  const getComponentCollapseState = (componentId: number): boolean => {
    if (componentCollapseStates.has(componentId)) {
      return componentCollapseStates.get(componentId)!;
    }
    return collapseAll ? componentId !== lastAddedComponentId : false;
  };

  useEffect(() => {
    // Clear individual collapse states when collapseAll is toggled
    // so that all components follow the global collapse state
    setComponentCollapseStates(new Map());
  }, [collapseAll]);

  return { updateComponentCollapseState, getComponentCollapseState };
}
