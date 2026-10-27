import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import useTranslations from "../hooks/useTranslations.ts";

type ProjectSaveControlsProps = {
  // Archived versions can't be edited, so they get a notice instead of the buttons.
  isLatest: boolean;
  loadingProject: boolean;
  version: number | undefined;
  saveProject: () => void;
  onArchive: () => void;
  onPrintSummary: () => void;
  includeFunctionsInReport: boolean;
  setIncludeFunctionsInReport: (include: boolean) => void;
};

// Save, archive-as-version and summary report buttons.
export default function ProjectSaveControls({
  isLatest,
  loadingProject,
  version,
  saveProject,
  onArchive,
  onPrintSummary,
  includeFunctionsInReport,
  setIncludeFunctionsInReport,
}: ProjectSaveControlsProps) {
  const translation = useTranslations().projectPage;

  if (!isLatest) {
    return (
      <div className="flex flex-row gap-2 w-full">
        <div
          role="status"
          className="text-center w-full bg-fisma-red text-white text-xs py-3 px-4"
        >
          {translation.cannotEditOrSaveArchivedVersion}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-row gap-2 w-full">
        <button
          className={`w-full ${
            !loadingProject
              ? "bg-fisma-blue hover:bg-fisma-dark-blue cursor-pointer"
              : "bg-fisma-gray"
          } text-white text-xs py-3 px-4`}
          onClick={() => saveProject()}
          disabled={loadingProject}
        >
          {translation.saveProject}
        </button>
        <button
          className={`w-full ${
            !loadingProject
              ? "bg-fisma-blue hover:bg-fisma-dark-blue cursor-pointer"
              : "bg-fisma-gray"
          } text-white text-xs py-3 px-4`}
          onClick={onArchive}
          disabled={loadingProject}
        >
          {translation.archiveProjectAsVersion} {version}
        </button>
      </div>
      <button
        className={`w-full ${
          !loadingProject
            ? "bg-red-600 hover:bg-red-700 cursor-pointer"
            : "bg-fisma-gray"
        } text-white text-xs py-3 px-4 flex items-center justify-center gap-2`}
        onClick={onPrintSummary}
        disabled={loadingProject}
      >
        <FontAwesomeIcon icon={faFilePdf} />
        {translation.overviewSummaryReport}
      </button>
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={includeFunctionsInReport}
          onChange={(e) => setIncludeFunctionsInReport(e.target.checked)}
        />
        {translation.includeFunctionsInReport}
      </label>
    </div>
  );
}
