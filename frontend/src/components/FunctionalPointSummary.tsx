import {
  Project,
  ClassName,
  ComponentType,
  TGenericComponent,
} from "../lib/types";
import { downloadProjectComponentsCsv, createPdf } from "../lib/printUtils";
import {
  calculateTotalPossiblePoints,
  getGroupedComponents,
  calculateParentOnlyPoints,
  calculateParentOnlyPossiblePoints,
  calculateGrandTotalPoints,
  calculateGrandTotalPossiblePoints,
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

  const parentOnlyPoints = calculateParentOnlyPoints(
    project.functionalComponents,
  );
  const parentOnlyPossiblePoints = calculateParentOnlyPossiblePoints(
    project.functionalComponents,
  );
  const grandTotalPoints = calculateGrandTotalPoints(
    project.functionalComponents,
  );
  const grandTotalPossiblePoints = calculateGrandTotalPossiblePoints(
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

  const handleExportCSV = () => {
    downloadProjectComponentsCsv(
      project,
      translation.csvHeaders,
      translation.functionalClassComponent.classNameOptions,
      translation.functionalClassComponent.componentTypeOptions,
    );
  };

  return (
    <div className="flex flex-col border-2 p-4 bg-white h-[calc(55vh-5rem)] overflow-y-auto sticky top-20">
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {/* Parent Components */}
        {getGroupedComponents(project.functionalComponents).parentGroups.map(
          (group) => {
            const componentCount = group.components.reduce(
              (acc, curr) => acc + curr.count,
              0,
            );
            const totalPointsForClass = group.components.reduce(
              (acc, curr) => acc + curr.points,
              0,
            );

            // Collect all parent components for this class
            const allComponentsInThisClass: TGenericComponent[] = [];
            project.functionalComponents.forEach((component) => {
              if (component.className === group.className) {
                allComponentsInThisClass.push(component);
              }
            });

            const possiblePointsForClass = calculateTotalPossiblePoints(
              allComponentsInThisClass,
            );

            return (
              <div
                key={group.className}
                className="flex gap-2 sm:gap-5 justify-between w-full pb-3 text-sm sm:text-base"
              >
                <div>
                  <b>
                    <span className="text-blue-600 pr-2">{componentCount}</span>{" "}
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
                    const componentsOfThisType =
                      allComponentsInThisClass.filter((component) =>
                        groupedTypes.type === null
                          ? !component.componentType
                          : component.componentType === groupedTypes.type,
                      );
                    const possiblePointsForType =
                      calculateTotalPossiblePoints(componentsOfThisType);

                    return (
                      <div key={idx}>
                        <span className="text-blue-500 pr-2">
                          {groupedTypes.count}{" "}
                        </span>
                        {groupedTypes.type
                          ? translation.functionalClassComponent
                              .componentTypeOptions[
                              groupedTypes.type as ComponentType
                            ]
                          : translation.functionalPointSummary
                              .noSelectedComponentType}{" "}
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
          },
        )}

        {/* Subcomponents - with padding */}
        {getGroupedComponents(project.functionalComponents).subComponentGroups
          .length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-300">
            {getGroupedComponents(
              project.functionalComponents,
            ).subComponentGroups.map((group) => {
              const componentCount = group.components.reduce(
                (acc, curr) => acc + curr.count,
                0,
              );
              const totalPointsForClass = group.components.reduce(
                (acc, curr) => acc + curr.points,
                0,
              );

              // Collect all subcomponents for this class
              const allSubComponentsInThisClass: TGenericComponent[] = [];
              project.functionalComponents.forEach((component) => {
                if (component.subComponents) {
                  component.subComponents.forEach((subComponent) => {
                    if (subComponent.className === group.className) {
                      allSubComponentsInThisClass.push(
                        subComponent as TGenericComponent,
                      );
                    }
                  });
                }
              });

              const possiblePointsForClass = calculateTotalPossiblePoints(
                allSubComponentsInThisClass,
              );

              return (
                <div
                  key={group.className}
                  className="flex gap-2 sm:gap-5 justify-between w-full pb-3 text-sm sm:text-base"
                >
                  <div>
                    <b>
                      <span className="text-blue-600 pr-2">
                        {componentCount}
                      </span>{" "}
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
                      const componentsOfThisType =
                        allSubComponentsInThisClass.filter((component) =>
                          groupedTypes.type === null
                            ? !component.componentType
                            : component.componentType === groupedTypes.type,
                        );
                      const possiblePointsForType =
                        calculateTotalPossiblePoints(componentsOfThisType);

                      return (
                        <div key={idx}>
                          <span className="text-blue-500 pr-2">
                            {groupedTypes.count}{" "}
                          </span>
                          {groupedTypes.type
                            ? translation.functionalClassComponent
                                .componentTypeOptions[
                                groupedTypes.type as ComponentType
                              ]
                            : translation.functionalPointSummary
                                .noSelectedComponentType}{" "}
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
        )}
      </div>

      {/* Parent Components Only Progress Bar */}
      <div className="w-full mb-4 mt-4">
        <div className="flex justify-between text-xs font-medium text-gray-600">
          <span>
            {translation.functionalPointSummary.parentComponents}:{" "}
            {parentOnlyPoints.toFixed(2)}{" "}
            {translation.functionalPointSummary.functionalPointText} (
            {parentOnlyPossiblePoints > 0
              ? ((parentOnlyPoints / parentOnlyPossiblePoints) * 100).toFixed(1)
              : "0.0"}
            %)
          </span>
          <span>
            {parentOnlyPossiblePoints.toFixed(2)}{" "}
            {translation.functionalPointSummary.functionalPointText} (100%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            className="bg-blue-400 h-2 rounded-full"
            style={{
              width:
                parentOnlyPossiblePoints > 0
                  ? `${(parentOnlyPoints / parentOnlyPossiblePoints) * 100}%`
                  : "0%",
            }}
          />
        </div>
      </div>

      {/* Grand Total Progress Bar (More Prominent) */}
      <div className="w-full border-t-2 border-gray-300 pt-3">
        <div className="flex justify-between text-base font-bold">
          <span>
            {translation.functionalPointSummary.grandTotal}:{" "}
            {grandTotalPoints.toFixed(2)}{" "}
            {translation.functionalPointSummary.functionalPointText} (
            {grandTotalPossiblePoints > 0
              ? ((grandTotalPoints / grandTotalPossiblePoints) * 100).toFixed(1)
              : "0.0"}
            %)
          </span>
          <span>
            {grandTotalPossiblePoints.toFixed(2)}{" "}
            {translation.functionalPointSummary.functionalPointText} (100%)
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-4 mt-2">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{
              width:
                grandTotalPossiblePoints > 0
                  ? `${(grandTotalPoints / grandTotalPossiblePoints) * 100}%`
                  : "0%",
            }}
          />
        </div>
      </div>

      <div className="flex flex-row gap-2 mt-3 justify-center">
        <button
          onClick={handleExportCSV}
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
