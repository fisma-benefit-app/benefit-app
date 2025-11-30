import {
  faCaretDown,
  faCaretUp,
  faTrash,
  faLayerGroup,
  faGripVertical,
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useState, useEffect } from "react";
import useTranslations from "../hooks/useTranslations.ts";
import { classNameOptions } from "../lib/fc-constants.ts";
import {
  getComponentTypeOptions,
  getInputFields,
  getClosestCompletionOption,
  isMultiLayerArchitectureComponent,
  recalculateReadingReferences,
  recalculateWritingReferences,
  resetFunctionalComponentParameters,
} from "../lib/fc-service-functions.ts";
import {
  calculateBasePoints,
  calculateComponentPoints,
} from "../lib/centralizedCalculations.ts";
import {
  CalculationParameter,
  ClassName,
  ComponentType,
  Project,
  ProjectResponse,
  TGenericComponent,
} from "../lib/types.ts";
import ConfirmModal from "./ConfirmModal.tsx";
import SubComponentsModal from "./SubComponentsModal.tsx";
import FunctionalClassSubComponent from "./FunctionalClassSubComponent.tsx";

type FunctionalClassComponentProps = {
  component: TGenericComponent;
  deleteFunctionalComponent: (componentId: number) => Promise<void>;
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project | null>>;
  setProjectResponse: React.Dispatch<
    React.SetStateAction<ProjectResponse | null>
  >;
  isLatest: boolean;
  collapsed: boolean;
  onCollapseChange: (componentId: number, collapsed: boolean) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  debouncedSaveProject: () => void;
  onMLAToggle: (componentId: number, newValue: boolean) => void;
};

export default function FunctionalClassComponent({
  component,
  deleteFunctionalComponent,
  project,
  setProject,
  isLatest,
  collapsed,
  onCollapseChange,
  debouncedSaveProject,
  dragHandleProps,
  onMLAToggle,
}: FunctionalClassComponentProps) {
  const toggleCollapse = () => {
    onCollapseChange(component.id, !collapsed);
  };

  const [isSubComponentsModalOpen, setSubComponentsModalOpen] = useState(false);

  const [showSubComponents, setShowSubComponents] = useState(true);

  // State to toggle between showing totals with or without MLA
  const [showMLATotal, setShowMLATotal] = useState(true);

  // Hide subcomponents when parent component is collapsed
  useEffect(() => {
    if (collapsed) {
      setShowSubComponents(false);
    }
  }, [collapsed]);

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const translation = useTranslations().functionalClassComponent;

  const componentTypeOptions = getComponentTypeOptions(component.className);
  const inputFields = getInputFields(component.className);

  // Calculate functional points using centralized calculations
  const fullPoints = calculateBasePoints(component);
  const pointsByDegreeOfCompletion = calculateComponentPoints(component);

  // Calculate total points including subcomponents
  const totalPointsWithSubComponents = component.subComponents
    ? component.subComponents.reduce(
        (total, subComp) =>
          total + calculateComponentPoints(subComp as TGenericComponent),
        pointsByDegreeOfCompletion,
      )
    : pointsByDegreeOfCompletion;

  const totalFullPointsWithSubComponents = component.subComponents
    ? component.subComponents.reduce(
        (total, subComp) =>
          total + calculateBasePoints(subComp as TGenericComponent),
        fullPoints,
      )
    : fullPoints;

  const degreeOfCompletionOptions = new Map([
    ["0.1", translation.degreeOfCompletion.specified],
    ["0.3", translation.degreeOfCompletion.planned],
    ["0.7", translation.degreeOfCompletion.implemented],
    ["0.9", translation.degreeOfCompletion.tested],
    ["1", translation.degreeOfCompletion.readyForUse],
  ]);

  const handleClassNameChange = (e: ChangeEvent<HTMLSelectElement>) => {
    //user can select classname only from predefined options
    const newClassName = e.target.value as ClassName;

    const updatedComponent = resetFunctionalComponentParameters({
      ...component,
      className: newClassName,
      componentType:
        newClassName !== "Interactive end-user input service"
          ? null
          : ("1-functional" as ComponentType), // automatically assigned component type value for Interactive end-user input services
      isMLA: false,
      subComponents: undefined, // clears possible subcomponents when a new functional component class is selected
    });

    const updatedComponents = project.functionalComponents.map(
      (functionalComponent) =>
        functionalComponent.id === component.id
          ? updatedComponent
          : functionalComponent,
    );

    const updatedProject = {
      ...project,
      functionalComponents: updatedComponents,
    };
    setProject(updatedProject);

    if (isLatest) {
      debouncedSaveProject();
    }
  };

  const handleOptionTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    //user can select component type only from predefined options
    const newOptionType = e.target.value as ComponentType;

    const updatedComponent = {
      ...component,
      componentType: newOptionType,
      isMLA:
        isMultiLayerArchitectureComponent({
          ...component,
          componentType: newOptionType,
        }) && component.isMLA, // isMLA is preserved only if both the new component type is eligible AND it was previously true.
    };
    const updatedComponents = project.functionalComponents.map(
      (functionalComponent) =>
        functionalComponent.id === component.id
          ? updatedComponent
          : functionalComponent,
    );

    const updatedProject = {
      ...project,
      functionalComponents: updatedComponents,
    };
    setProject(updatedProject);

    if (isLatest) {
      debouncedSaveProject();
    }
  };

  const handleComponentChange = (
    e:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>,
  ) => {
    let updatedComponent: TGenericComponent;
    let value = e.target.value;

    //check if the updated attribute needs to be converted to a number for math
    //if there are new input fields in the future where the value is supposed to be a string add their id here
    if (["title", "description"].includes(e.target.id)) {
      updatedComponent = { ...component, [e.target.id]: value };
    } else if (
      e.target.id === "degreeOfCompletion" ||
      e.target.id === "degreeOfCompletionOptions"
    ) {
      // Handle empty field - set to null
      if (value === "") {
        updatedComponent = {
          ...component,
          degreeOfCompletion: null,
        };
      } else {
        // Replace comma with dot for decimal parsing
        const normalizedValue = value.replace(",", ".");

        const num = parseFloat(normalizedValue);

        if (isNaN(num)) {
          value = "0";
        } else {
          if (num < 0) value = "0";
          if (num > 1) value = "1";
        }
        updatedComponent = {
          ...component,
          degreeOfCompletion: parseFloat(parseFloat(value).toFixed(2)),
        };
      }
    } else {
      const num = parseFloat(value);
      // correct any number greater than 99999 and less than 0
      if (num > 99999) {
        value = "99999";
      } else if (num < 0) {
        value = "0";
      }

      updatedComponent = { ...component, [e.target.id]: value };
    }

    // If MLA component, update changes to sub-components in real time
    if (updatedComponent.isMLA && updatedComponent.subComponents) {
      updatedComponent = {
        ...updatedComponent,
        subComponents: updatedComponent.subComponents.map((subComp) => ({
          ...subComp,
          title: `${updatedComponent.title || "Untitled"}-${subComp.subComponentType}`,
          description: updatedComponent.description,
          dataElements: updatedComponent.dataElements,
          // references are recalculated, as they are a combined sum of parent references under certain circumstances
          readingReferences: recalculateReadingReferences(
            updatedComponent,
            subComp,
          ),
          writingReferences: recalculateWritingReferences(
            updatedComponent,
            subComp,
          ),
          functionalMultiplier: updatedComponent.functionalMultiplier,
          operations: updatedComponent.operations,
          degreeOfCompletion: updatedComponent.degreeOfCompletion,
          isReadonly: true,
        })),
      };
    }

    const updatedComponents = project.functionalComponents.map(
      (functionalComponent) =>
        functionalComponent.id === component.id
          ? updatedComponent
          : functionalComponent,
    );
    const updatedProject = {
      ...project,
      functionalComponents: updatedComponents,
    };
    setProject(updatedProject);

    if (isLatest) {
      debouncedSaveProject();
    }
  };

  const handleMLAChange = () => {
    onMLAToggle(component.id, !component.isMLA);
  };

  return (
    <>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-4 border-2 border-fisma-gray bg-gray-200 w-full p-4 rounded-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Drag handle */}
          <div
            {...dragHandleProps}
            className="cursor-grab bg-fisma-gray text-white py-2 px-2"
          >
            ::
          </div>
          <div className="flex-1 min-w-[200px]">
            <input
              className="w-full border-2 border-fisma-gray bg-white p-2 text-sm sm:text-base"
              id="title"
              placeholder={translation.titlePlaceholder}
              value={component.title || ""}
              onChange={handleComponentChange}
              disabled={!isLatest}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-start sm:justify-end">
            <div className="flex gap-2 items-center">
              {/* Collapse button */}
              <button
                type="button"
                onClick={toggleCollapse}
                className="bg-fisma-blue hover:bg-fisma-dark-blue text-white py-2 px-3 cursor-pointer"
              >
                <FontAwesomeIcon icon={collapsed ? faCaretDown : faCaretUp} />
              </button>
              {/* Delete button */}
              <button
                type="button"
                className={`${isLatest ? "bg-fisma-red hover:brightness-110 cursor-pointer" : "bg-fisma-gray"} text-white py-2 px-3`}
                onClick={() => setConfirmModalOpen(true)}
                disabled={!isLatest}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        </div>

        {!collapsed && (
          <>
            {/* Degree of Completion Section */}
            <div className="flex flex-col gap-2 bg-fisma-light-gray border-2 border-fisma-gray p-3 rounded-md">
              <label className="font-bold text-fisma-blue">
                {translation.degreeOfCompletionPlaceholder}:
              </label>
              <div className="flex flex-wrap gap-4">
                <input
                  id="degreeOfCompletion"
                  type="number"
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={component.degreeOfCompletion ?? ""}
                  onChange={handleComponentChange}
                  className="border-2 border-fisma-dark-gray bg-white flex-1 min-w-[180px] max-w-[225px] p-2 text-base rounded-md"
                  disabled={!isLatest}
                />
                <select
                  id="degreeOfCompletionOptions"
                  value={getClosestCompletionOption(
                    component.degreeOfCompletion ?? 0,
                  )}
                  onChange={handleComponentChange}
                  className="border-2 border-fisma-dark-gray bg-white flex-1 min-w-[180px] max-w-[225px] p-2 text-base rounded-md"
                  disabled={!isLatest}
                >
                  <option disabled value="">
                    {translation.selectDegreeOfCompletion}
                  </option>
                  {Array.from(degreeOfCompletionOptions.entries()).map(
                    ([key, value]) => (
                      <option key={key} value={key}>
                        {key} - {value}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <p className="text-xs text-gray-900">
                {translation.degreeOfCompletionDescription}
              </p>
            </div>

            {/* Description / Comment Section */}
            <div className="flex flex-col gap-2 bg-white border-2 border-fisma-light-gray p-3 rounded-md">
              <label
                htmlFor="description"
                className="font-medium text-fisma-blue"
              >
                {translation.descriptionPlaceholder}:
              </label>
              <textarea
                id="description"
                value={component.description || ""}
                onChange={handleComponentChange}
                className="w-full border-2 border-fisma-gray bg-white p-2 text-sm sm:text-base rounded-md"
                rows={3}
                disabled={!isLatest}
                placeholder={translation.descriptionPlaceholder}
              />
            </div>

            {/* Metadata Section */}
            <div className="flex flex-row flex-wrap gap-3 items-center">
              <select
                id="className"
                value={component.className || ""}
                onChange={handleClassNameChange}
                className="border-2 border-fisma-light-gray bg-white p-2 flex-1 min-w-[180px] text-base rounded-md"
                disabled={!isLatest}
              >
                <option value="">{translation.classNamePlaceholder}</option>
                {classNameOptions.map((className) => (
                  <option key={className} value={className}>
                    {translation.classNameOptions[className]}
                  </option>
                ))}
              </select>

              {component.className && (
                <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
                  <select
                    id="componentType"
                    value={component.componentType || ""}
                    onChange={handleOptionTypeChange}
                    className="border-2 border-fisma-light-gray bg-white p-2 text-base rounded-md"
                    disabled={!isLatest}
                  >
                    {component.className !==
                      "Interactive end-user input service" && (
                      <option value="">
                        {translation.componentTypePlaceholder}
                      </option>
                    )}
                    {componentTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {translation.componentTypeOptions[option]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 bg-white border-2 border-fisma-light-gray p-3 rounded-md w-full">
              <label className="font-bold text-fisma-blue">
                {
                  translation.isThisFunctionalComponentAPartOfMultiLayerArchitecture
                }
              </label>
              <div className="flex items-center gap-3">
                {isMultiLayerArchitectureComponent(component) && (
                  <input
                    id="mlaCheckBox"
                    type="checkbox"
                    className="w-4 h-4"
                    checked={component.isMLA}
                    disabled={
                      !isMultiLayerArchitectureComponent(component) || !isLatest
                    }
                    onChange={handleMLAChange}
                  />
                )}

                {component.isMLA && (
                  <button
                    type="button"
                    onClick={() => setShowSubComponents(!showSubComponents)}
                    className="text-sm text-fisma-blue hover:underline flex items-center gap-2"
                  >
                    {showSubComponents
                      ? translation.hideMultiLayerInterfaces
                      : translation.showMultiLayerInterfaces}
                    {component.subComponents &&
                      component.subComponents.length > 0 && (
                        <span>({component.subComponents.length})</span>
                      )}
                  </button>
                )}
              </div>
              {!isMultiLayerArchitectureComponent(component) && (
                <label className="flex items-center gap-3 text-gray-400">
                  {" "}
                  {translation.notAvailableForThisFunctionalComponentType}
                </label>
              )}
            </div>

            {/* Parameters Section */}
            {component.className && (
              <div className="flex flex-wrap gap-4 bg-white border-2 border-fisma-light-gray p-3 rounded-md mt-2">
                {Object.entries(component)
                  .filter(([key]) => inputFields.includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1 items-start">
                      <label htmlFor={key} className="font-medium">
                        {translation.parameters[key as CalculationParameter]}:
                      </label>
                      <input
                        id={key}
                        type="number"
                        value={(value as number) || ""}
                        onChange={handleComponentChange}
                        className="w-[120px] border-2 border-fisma-light-gray bg-white p-2 rounded-md"
                      />
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {/* Component Points Progress Bar */}
        <div className="border-t pt-3">
          {component.subComponents && component.subComponents.length > 0 ? (
            // Show toggle-able total for components with MLA
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-blue-700 font-medium">
                  {showMLATotal
                    ? translation.totalWithMultiLayerInterfaces
                    : translation.totalWithoutMultiLayerInterfaces}
                </div>
                <button
                  type="button"
                  onClick={() => setShowMLATotal(!showMLATotal)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title={translation.toggleTotalView}
                >
                  <FontAwesomeIcon icon={faArrowsRotate} className="text-sm" />
                </button>
              </div>
              <div className="flex justify-between text-xs font-semibold text-blue-900 mb-1">
                <span>
                  {translation.functionalPointText}:{" "}
                  {showMLATotal
                    ? totalPointsWithSubComponents.toFixed(2)
                    : pointsByDegreeOfCompletion.toFixed(2)}{" "}
                  (
                  {showMLATotal
                    ? totalFullPointsWithSubComponents > 0
                      ? (
                          (totalPointsWithSubComponents /
                            totalFullPointsWithSubComponents) *
                          100
                        ).toFixed(1)
                      : "0.0"
                    : fullPoints > 0
                      ? (
                          (pointsByDegreeOfCompletion / fullPoints) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                  %)
                </span>
                <span>
                  {translation.functionalPointReadyText}:{" "}
                  {showMLATotal
                    ? totalFullPointsWithSubComponents.toFixed(2)
                    : fullPoints.toFixed(2)}{" "}
                  (100%)
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: showMLATotal
                      ? totalFullPointsWithSubComponents > 0
                        ? `${(totalPointsWithSubComponents / totalFullPointsWithSubComponents) * 100}%`
                        : "0%"
                      : fullPoints > 0
                        ? `${(pointsByDegreeOfCompletion / fullPoints) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          ) : (
            // Show simple progress bar for components without MLA
            <>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>
                  {translation.functionalPointText}:{" "}
                  {pointsByDegreeOfCompletion.toFixed(2)} (
                  {fullPoints > 0
                    ? ((pointsByDegreeOfCompletion / fullPoints) * 100).toFixed(
                        1,
                      )
                    : "0.0"}
                  %)
                </span>
                <span>
                  {translation.functionalPointReadyText}:{" "}
                  {fullPoints.toFixed(2)} (100%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{
                    width:
                      fullPoints > 0
                        ? `${(pointsByDegreeOfCompletion / fullPoints) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </>
          )}
        </div>

        {component.isMLA && (
          <div className="mt-4">
            {showSubComponents &&
              component.subComponents &&
              component.subComponents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px bg-gradient-to-r from-blue-400 to-transparent flex-grow"></div>
                    <label className="font-semibold text-blue-600 text-sm uppercase tracking-wide">
                      {translation.multiLayerInterfaces}
                    </label>
                    <div className="h-px bg-gradient-to-l from-blue-400 to-transparent flex-grow"></div>
                  </div>
                  {component.subComponents.map((subComp) => (
                    <div key={subComp.id} className="relative">
                      <FunctionalClassSubComponent
                        component={subComp}
                        collapsed={false}
                      />
                    </div>
                  ))}
                </div>
              )}

            {/* Message if MLA is enabled but no subcomponents loaded */}
            {showSubComponents &&
              (!component.subComponents ||
                component.subComponents.length === 0) && (
                <div className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-md border border-gray-200">
                  {translation.noMultiLayerInterfaces}
                </div>
              )}
          </div>
        )}
      </form>

      {component.isMLA && component.subComponents && (
        <SubComponentsModal
          open={isSubComponentsModalOpen}
          setOpen={setSubComponentsModalOpen}
          subComponents={component.subComponents}
          parentTitle={component.title || "Untitled component"}
        />
      )}

      <ConfirmModal
        message={
          component.title
            ? `${translation.confirmDeleteMessage} "${component.title}?"`
            : `${translation.confirmDeleteMessage}?`
        }
        open={isConfirmModalOpen}
        setOpen={setConfirmModalOpen}
        onConfirm={() => deleteFunctionalComponent(component.id)}
      />
    </>
  );
}
