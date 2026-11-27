import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useId, useRef, useState } from "react";
import useTranslations from "../hooks/useTranslations";

export default function ShortcutTooltip() {
  const toolTipTranslations = useTranslations().shortcutTooltip;
  const tooltipId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [openedByClick, setOpenedByClick] = useState(false);
  const isOpen = isHovered || isFocused || openedByClick;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsHovered(false);
        setIsFocused(false);
        setOpenedByClick(false);
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setOpenedByClick(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-stretch"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setIsHovered(true);
      }}
      onPointerLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        aria-label={toolTipTranslations.buttonLabel}
        aria-describedby={tooltipId}
        className="bg-fisma-blue hover:bg-fisma-dark-blue text-white px-3 cursor-pointer"
        onFocus={(event) => {
          setIsFocused(event.currentTarget.matches(":focus-visible"));
        }}
        onBlur={() => {
          setIsFocused(false);
          setOpenedByClick(false);
        }}
        onClick={() => {
          if (!isHovered && !isFocused) setOpenedByClick(!openedByClick);
        }}
      >
        <FontAwesomeIcon icon={faCircleInfo} />
      </button>
      <div
        id={tooltipId}
        role="tooltip"
        hidden={!isOpen}
        className="absolute left-0 top-full z-50 w-56 pt-2"
      >
        <div className="flex flex-col gap-3 rounded border border-gray-300 bg-white p-2 text-xs text-gray-800 shadow-lg">
          <div>{toolTipTranslations.toggleViewTip}</div>
          <div>{toolTipTranslations.newComponentTip}</div>
          <div>{toolTipTranslations.componentDragTip}</div>
          <div>{toolTipTranslations.componentMultipleSelectTip}</div>
          <div>{toolTipTranslations.selectionClearTip}</div>
        </div>
      </div>
    </div>
  );
}
