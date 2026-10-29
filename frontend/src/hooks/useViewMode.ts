import { useCallback, useEffect, useState } from "react";

// How the component grid is displayed: compact or full cards, whether the cards start
// collapsed, and whether descriptions show all their rows. The "v" key toggles compact mode.
export default function useViewMode() {
  const [collapseAll, setCollapseAll] = useState<boolean>(true);
  const [descriptionRowsExpanded, setDescriptionRowsExpanded] =
    useState<boolean>(true);
  const [isCompactMode, setIsCompactMode] = useState<boolean>(false);

  const toggleDescriptionRows = () => {
    setDescriptionRowsExpanded((prev) => !prev);
  };

  const toggleCompactMode = useCallback(() => {
    if (isCompactMode) {
      setIsCompactMode(false);
      setCollapseAll(true);
    } else {
      setIsCompactMode(true);
      setCollapseAll(false);
    }
  }, [isCompactMode]);

  //keyboard shortcut for toggling between compact and full view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      //guard against toggling view when typing in an input/textarea field or using keyboard shortcuts
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (isTyping) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        toggleCompactMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCompactMode]);

  return {
    collapseAll,
    setCollapseAll,
    descriptionRowsExpanded,
    toggleDescriptionRows,
    isCompactMode,
    toggleCompactMode,
  };
}
