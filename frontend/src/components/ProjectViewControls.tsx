import useTranslations from "../hooks/useTranslations.ts";
import useViewMode from "../hooks/useViewMode.ts";

type ProjectViewControlsProps = {
  viewMode: ReturnType<typeof useViewMode>;
};

// Buttons that change how the component grid is displayed.
export default function ProjectViewControls({
  viewMode,
}: ProjectViewControlsProps) {
  const translation = useTranslations().projectPage;
  const {
    collapseAll,
    setCollapseAll,
    descriptionRowsExpanded,
    toggleDescriptionRows,
    isCompactMode,
    toggleCompactMode,
  } = viewMode;

  return (
    <>
      <div className="flex flex-row gap-2 w-full">
        <button
          className={`${isCompactMode ? "w-full" : "w-[49%]"} bg-fisma-blue hover:bg-fisma-dark-blue text-white px-4 py-3 text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis`}
          onClick={() => {
            setCollapseAll((prev) => !prev);
          }}
        >
          {collapseAll ? translation.expandAll : translation.collapseAll}
        </button>
        {!isCompactMode && (
          <button
            className="w-[49%] bg-fisma-blue hover:bg-fisma-dark-blue text-white px-4 py-3 text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis"
            onClick={toggleDescriptionRows}
          >
            {descriptionRowsExpanded
              ? translation.collapseDescriptions
              : translation.expandDescriptions}
          </button>
        )}
      </div>
      <div className="flex w-full">
        <button
          className="w-full bg-fisma-blue hover:bg-fisma-dark-blue text-white px-4 py-3 text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis"
          onClick={toggleCompactMode}
        >
          {isCompactMode
            ? translation.disableCompactMode
            : translation.enableCompactMode}
        </button>
      </div>
    </>
  );
}
