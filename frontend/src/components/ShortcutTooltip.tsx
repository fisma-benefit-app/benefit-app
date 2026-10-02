import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import useTranslations from "../hooks/useTranslations";

export default function ShortcutTooltip() {
  const toolTipTranslations = useTranslations().shortcutTooltip;

  return (
    <div className="group relative flex items-stretch">
      <button
        type="button"
        className="bg-fisma-blue hover:bg-fisma-dark-blue text-white px-3 cursor-default"
      >
        <FontAwesomeIcon icon={faCircleInfo} />
      </button>
      <div
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-56 rounded border border-gray-300 bg-white p-2 text-xs text-gray-800 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <div>{toolTipTranslations.toggleViewTip}</div>
        <div>{toolTipTranslations.componentDragTip}</div>
        <div>{toolTipTranslations.componentMultipleSelectTip}</div>
        <div>{toolTipTranslations.selectionClearTip}</div>
      </div>
    </div>
  );
}
