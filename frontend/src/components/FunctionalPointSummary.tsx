import { Project, ClassName, ComponentType } from "../lib/types";
import { downloadProjectComponentsCsv, createPdf } from "../lib/printUtils";
import {
  calculateTotalPoints,
  calculateTotalPossiblePoints,
  getGroupedComponents,
  calculateComponentsWithPoints,
  calculateBasePoints,
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
  const totalPossiblePoints = calculateTotalPossiblePoints(
    project.functionalComponents,
  );

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
        {getGroupedComponents(project.functionalComponents).map((group) => {
          const componentCount = group.components.reduce(
            (acc, curr) => acc + curr.count,
            0,
          );
          const totalPointsForClass = group.components.reduce(
            (acc, curr) => acc + curr.points,
            0,
          );
          const componentsInThisClass = project.functionalComponents.filter(
            (component) => component.className === group.className,
          );
          const possiblePointsForClass = calculateTotalPossiblePoints(
            componentsInThisClass,
          );

          return (
            <div
              key={group.className}
              className="flex gap-2 sm:gap-5 justify-between w-full pb-3 text-sm sm:text-base"
            >
              <div>
                <b>
                  <span className="text-blue-600 pr-2">
                    {componentCount + " "}
                  </span>
                  {
                    translation.functionalClassComponent.classNameOptions[
                      group.className as ClassName
                    ]
                  }{" "}
                  {}
                </b>
                <br />
                {group.components.map((groupedTypes, idx) => {
                  // Calculate possible points for this specific component type
                  const componentsOfThisType = componentsInThisClass.filter(
                    (component) =>
                      component.componentType === groupedTypes.type,
                  );
                  const possiblePointsForType =
                    calculateTotalPossiblePoints(componentsOfThisType);

                  return (
                    <div key={idx}>
                      <span className="text-blue-500 pr-2">
                        {groupedTypes.count}{" "}
                      </span>
                      {
                        translation.functionalClassComponent
                          .componentTypeOptions[
                          groupedTypes.type as ComponentType
                        ]
                      }{" "}
                      <b>{groupedTypes.points.toFixed(2)}</b>{" "}
                      <span className="text-gray-400">
                        / {possiblePointsForType.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="whitespace-nowrap">
                <span className="font-semibold text-right">
                  {totalPointsForClass.toFixed(2)}
                </span>
                <span className="text-gray-400">
                  {" "}
                  / {possiblePointsForClass.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full">
        <div className="flex justify-between text-sm font-medium">
          <span>
            {totalPoints.toFixed(2)}{" "}
            {translation.functionalPointSummary.functionalPointText} (
            {((totalPoints / totalPossiblePoints) * 100).toFixed(1)}%)
          </span>
          <span>
            {totalPossiblePoints.toFixed(2)}{" "}
            {translation.functionalPointSummary.functionalPointText} (100%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
          <div
            className="bg-blue-600 h-3 rounded-full"
            style={{ width: `${(totalPoints / totalPossiblePoints) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-row gap-2 mt-3 justify-center">
        <button
          onClick={() =>
            downloadProjectComponentsCsv({
              ...project,
              functionalComponents: calculateComponentsWithPoints(
                project.functionalComponents,
              ),
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
