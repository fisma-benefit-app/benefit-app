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
  calculateMLALayerDetails,
  calculateMLAMessageCounts,
  hasMLAComponents,
} from "../lib/centralizedCalculations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import useTranslations from "../hooks/useTranslations.ts";
import useProjects from "../hooks/useProjects.tsx";
import { useState } from "react";

type FunctionalClassComponentProps = {
  project: Project;
};

// All calculation logic moved to centralizedCalculations.ts

export const FunctionalPointSummary = ({
  project,
}: FunctionalClassComponentProps) => {
  const translation = useTranslations();
  const { sortedProjects, returnLatestOrPreviousVersion } = useProjects();
  const [activeTab, setActiveTab] = useState<"calculations" | "mla">(
    "calculations",
  );

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

  // MLA calculations
  const hasMLA = hasMLAComponents(project.functionalComponents);
  const mlaLayerDetails = hasMLA
    ? calculateMLALayerDetails(project.functionalComponents)
    : null;
  const mlaMessageCounts = hasMLA
    ? calculateMLAMessageCounts(project.functionalComponents)
    : null;

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
    <div className="flex flex-col border-2 p-4 mb-2 bg-white max-h-[calc(100vh-5rem)] overflow-y-auto sticky top-20">
      {/* Tabs */}
      {hasMLA && (
        <div role="tablist" className="flex border-b mb-4">
          <button
            role="tab"
            aria-selected={activeTab === "calculations"}
            onClick={() => setActiveTab("calculations")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "calculations"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {translation.functionalPointSummary.calculationsTab}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "mla"}
            onClick={() => setActiveTab("mla")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "mla"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {translation.functionalPointSummary.mlaDetailsTab}
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div
        role="tabpanel"
        id={activeTab === "calculations" ? "calculations-panel" : "mla-panel"}
        aria-labelledby={
          activeTab === "calculations" ? "calculations-tab" : "mla-tab"
        }
        className="max-h-[60vh] overflow-y-auto pr-2"
      >
        {activeTab === "calculations" ? (
          <>
            {/* Parent Components */}
            {getGroupedComponents(
              project.functionalComponents,
            ).parentGroups.map((group) => {
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
            })}

            {/* Subcomponents - with padding */}
            {getGroupedComponents(project.functionalComponents)
              .subComponentGroups.length > 0 && (
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
                            translation.functionalClassComponent
                              .classNameOptions[group.className as ClassName]
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
          </>
        ) : (
          // MLA Details Tab
          mlaLayerDetails &&
          mlaMessageCounts && (
            <div className="space-y-4">
              {/* Layer Details Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 font-semibold">
                        {translation.functionalPointSummary.layer}
                      </th>
                      <th className="text-center py-2 font-semibold">
                        {translation.functionalPointSummary.amount}
                      </th>
                      <th className="text-right py-2 font-semibold">
                        {translation.functionalPointSummary.functionalPointText}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* UI Layer */}
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-medium">
                        {translation.functionalPointSummary.uiLayer}
                      </td>
                      <td className="text-center text-blue-600 font-medium">
                        {mlaLayerDetails.ui.count}
                      </td>
                      <td className="text-right font-semibold">
                        {mlaLayerDetails.ui.points.toFixed(2)}{" "}
                        <span className="text-gray-400">
                          / {mlaLayerDetails.ui.possiblePoints.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                    {/* Business Layer */}
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-medium">
                        {translation.functionalPointSummary.businessLayer}
                      </td>
                      <td className="text-center text-blue-600 font-medium">
                        {mlaLayerDetails.business.count}
                      </td>
                      <td className="text-right font-semibold">
                        {mlaLayerDetails.business.points.toFixed(2)}{" "}
                        <span className="text-gray-400">
                          / {mlaLayerDetails.business.possiblePoints.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                    {/* Data Layer */}
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-medium">
                        {translation.functionalPointSummary.dataLayer}
                      </td>
                      <td className="text-center text-blue-600 font-medium">
                        {mlaLayerDetails.database.count}
                      </td>
                      <td className="text-right font-semibold">
                        {mlaLayerDetails.database.points.toFixed(2)}{" "}
                        <span className="text-gray-400">
                          / {mlaLayerDetails.database.possiblePoints.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Multilayer Messages */}
              <div className="pt-4 mt-4 border-t border-gray-300 space-y-2">
                <h3 className="font-semibold text-lg">
                  {translation.functionalPointSummary.multiLayerMessages}
                </h3>

                <div className="flex justify-between">
                  <span className="text-sm">
                    {translation.functionalPointSummary.uiToBusiness}:
                  </span>
                  <span className="font-semibold text-blue-600">
                    {mlaMessageCounts.uiToBusiness}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">
                    {translation.functionalPointSummary.businessToUi}:
                  </span>
                  <span className="font-semibold text-blue-600">
                    {mlaMessageCounts.businessToUi}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">
                    {translation.functionalPointSummary.businessToData}:
                  </span>
                  <span className="font-semibold text-blue-600">
                    {mlaMessageCounts.businessToDatabase}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">
                    {translation.functionalPointSummary.dataToBusiness}:
                  </span>
                  <span className="font-semibold text-blue-600">
                    {mlaMessageCounts.databaseToBusiness}
                  </span>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Parent Components Only Progress Bar if MLA has been selected to any component */}
      {hasMLA && (
        <div className="w-full mb-4 mt-4">
          <div className="flex justify-between text-xs font-medium text-gray-600">
            <span>
              {translation.functionalPointSummary.parentComponents}:{" "}
              {parentOnlyPoints.toFixed(2)}{" "}
              {translation.functionalPointSummary.functionalPointText} (
              {parentOnlyPossiblePoints > 0
                ? ((parentOnlyPoints / parentOnlyPossiblePoints) * 100).toFixed(
                    1,
                  )
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
      )}

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
