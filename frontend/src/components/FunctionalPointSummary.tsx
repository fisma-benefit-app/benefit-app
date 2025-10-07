import {
  Project,
  ClassName,
  ComponentType,
} from "../lib/types";
import { downloadProjectComponentsCsv, createPdf } from "../lib/printUtils";
import {
  calculateTotalPoints,
  calculateTotalPossiblePoints,
  getGroupedComponents,
  calculateComponentsWithPoints,
} from "../lib/centralizedCalculations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import useTranslations from "../hooks/useTranslations.ts";
import useProjects from "../hooks/useProjects.tsx";

type FunctionalClassComponentProps = {
  project: Project;
};

// All calculation logic moved to centralizedCalculations.ts

export const FunctionalPointSummary = ({
  project,
}: FunctionalClassComponentProps) => {
  const translation = useTranslations();
  const { sortedProjects, returnLatestOrPreviousVersion } = useProjects();

  //Get all versions of the same project
  const allProjectVersions: Project[] = sortedProjects.filter(
    (projectInArray) => project?.projectName === projectInArray.projectName,
  );
  //Get previous version for PDF-report changes comparison
  const previousOrCurrent = returnLatestOrPreviousVersion(
    project,
    allProjectVersions,
  );

  const totalPoints = calculateTotalPoints(project.functionalComponents);
  const totalPossiblePoints = calculateTotalPossiblePoints(project.functionalComponents);

  const handleExportPdf = () => {
    createPdf(
      project,
      previousOrCurrent,
      translation.printUtils,
      translation.functionalClassComponent.classNameOptions,
      translation.functionalClassComponent.componentTypeOptions,
    );
  };

  return (
    <div className="flex flex-col border-2 p-4 bg-white h-[calc(55vh-5rem)] overflow-y-auto sticky top-20">
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {getGroupedComponents(project.functionalComponents).map(
          (group) => {
            const componentCount = group.components.reduce(
              (acc, curr) => acc + curr.count,
              0,
            );
            const totalPoints = group.components.reduce(
              (acc, curr) => acc + curr.points,
              0,
            );

            return (
              <div
                key={group.className}
                className="flex gap-2 sm:gap-5 justify-between w-full pb-3 text-sm sm:text-base"
              >
                <div>
                  <b>
                    {componentCount + "x "}
                    {
                      translation.functionalClassComponent.classNameOptions[
                        group.className as ClassName
                      ]
                    }{" "}
                    {}
                  </b>
                  <br />
                  {group.components.map((groupedTypes, idx) => (
                    <div key={idx}>
                      {groupedTypes.count}x{" "}
                      {
                        translation.functionalClassComponent
                          .componentTypeOptions[
                          groupedTypes.type as ComponentType
                        ]
                      }{" "}
                      {groupedTypes.points.toFixed(2)}
                    </div>
                  ))}
                </div>
                <div className="font-semibold">{totalPoints.toFixed(2)}</div>
              </div>
            );
          },
        )}
      </div>

      <div className="flex flex-col gap-2 w-full border-t pt-4 text-sm sm:text-base">
        <div className="flex gap-5 justify-between w-full">
          <b>{translation.functionalPointSummary.total}</b>
          <b>
            {totalPoints.toFixed(2)}{" "}
            {translation.functionalPointSummary.functionalPointText}
          </b>
        </div>
        <div className="flex gap-5 justify-between w-full text-gray-600">
          <span>{translation.functionalPointSummary.totalPossible} (100%)</span>
          <span>
            {totalPossiblePoints.toFixed(2)}{" "}
            {translation.functionalPointSummary.functionalPointText}
          </span>
        </div>
        {totalPossiblePoints > 0 && (
          <div className="flex gap-5 justify-between w-full text-sm text-gray-500">
            <span>{translation.functionalPointSummary.completionPercentage}</span>
            <span>{((totalPoints / totalPossiblePoints) * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="flex flex-row gap-2 mt-3 justify-center">
        <button
          onClick={() =>
            downloadProjectComponentsCsv({
              ...project,
              functionalComponents: calculateComponentsWithPoints(project.functionalComponents),
            })
          }
          className="px-4 py-2 bg-fisma-blue hover:bg-fisma-dark-blue text-white cursor-pointer text-sm sm:text-base"
        >
          CSV <FontAwesomeIcon icon={faDownload} />
        </button>
        <button
          onClick={handleExportPdf}
          className="px-4 py-2 bg-fisma-blue hover:bg-fisma-dark-blue text-white cursor-pointer text-sm sm:text-base"
        >
          PDF <FontAwesomeIcon icon={faDownload} />
        </button>
      </div>
    </div>
  );
};
