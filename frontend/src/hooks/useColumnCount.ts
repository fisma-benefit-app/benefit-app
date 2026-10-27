import { useEffect, useState } from "react";

function getWideScreenColumnCount(
  isCompactMode: boolean,
  isPanelOpen: boolean,
) {
  if (isCompactMode) return isPanelOpen ? 4 : 5;
  return isPanelOpen ? 3 : 4;
}

// Number of columns in the component grid: fixed on narrow screens, and on wide ones
// it depends on the compact mode and whether the side panel takes up room.
export default function useColumnCount(
  isCompactMode: boolean,
  isPanelOpen: boolean,
) {
  const [columnCount, setColumnCount] = useState<number>(
    getWideScreenColumnCount(isCompactMode, isPanelOpen),
  );

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setColumnCount(1);
      } else if (width < 1280) {
        setColumnCount(2);
      } else {
        setColumnCount(getWideScreenColumnCount(isCompactMode, isPanelOpen));
      }
    };

    updateColumns();

    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [isPanelOpen, isCompactMode]);

  return columnCount;
}
