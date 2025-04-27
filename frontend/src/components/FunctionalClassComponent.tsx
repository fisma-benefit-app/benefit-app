import { ChangeEvent, useState } from "react";
import { classNameOptions } from "../lib/fc-constants.ts";
import { getCalculateFuntion, getComponentTypeOptions, getEmptyComponent, getResetedComponentWithClassName, getInputFields } from "../lib/fc-service-functions.ts";
import { TGenericComponent, Project, ClassName, ComponentType, CalculationParameter } from "../lib/types.ts";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import ConfirmModal from "./ConfirmModal.tsx";
import useTranslations from "../hooks/useTranslations.ts";

type FunctionalClassComponentProps = {
  component: TGenericComponent,
  deleteFunctionalComponent: (componentId: number) => Promise<void>,
  project: Project,
  setProject: React.Dispatch<React.SetStateAction<Project | null>>,
  isLatest: boolean
};

export default function FunctionalClassComponent({ component, deleteFunctionalComponent, project, setProject, isLatest }: FunctionalClassComponentProps) {

  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const translation = useTranslations().functionalClassComponent;

  const componentTypeOptions = getComponentTypeOptions(component.className || "");

  const inputFields = getInputFields(component.className || "");

  //todo: does the user need to explicitly select component type for points to be calculated?
  const calculateFunction = getCalculateFuntion((component.className && component.componentType) ? component.className : "");

  //@ts-expect-error(TODO - component should be typed before it goes to the calculation).
  const fullPoints = calculateFunction ? calculateFunction(component) : 0;
  const pointsByDegreeOfCompletion = (component.degreeOfCompletion || 0) * fullPoints;

  const handleClassNameChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newClassName = e.target.value;
    let updatedComponents;

    if (newClassName === "") {
      // Component that doesn't have a className is an "empty"-component, 
      // this is used for id generation in backend.
      updatedComponents = project.functionalComponents.map(functionalComponent => functionalComponent.id === component.id ? getEmptyComponent(component) : functionalComponent);
    } else {
      // If className changes, component gets reset (it has only className and ids).

      const updatedComponent = { ...component, className: newClassName, componentType: null };
      updatedComponents = project.functionalComponents.map(functionalComponent => functionalComponent.id === component.id ? updatedComponent : functionalComponent);
    }

    const updatedProject = { ...project, functionalComponents: updatedComponents };
    setProject(updatedProject);
  }

  const handleOptionTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newOptionType = e.target.value;
    let updatedComponents;

    if (newOptionType === "" && component.className) {
      updatedComponents = project.functionalComponents.map(functionalComponent => functionalComponent.id === component.id ? getResetedComponentWithClassName(component, component.className as string) : functionalComponent);
    } else {
      const updatedComponent = { ...component, componentType: newOptionType || null }
      updatedComponents = project.functionalComponents.map(functionalComponent => functionalComponent.id === component.id ? updatedComponent : functionalComponent);
    }

    const updatedProject = { ...project, functionalComponents: updatedComponents };
    setProject(updatedProject);
  }

  const handleComponentChange = (e: ChangeEvent<HTMLInputElement>) => {
    let updatedComponent;
    let value = e.target.value;

    //check if the updated attribute needs to be converted to a number for math
    //todo: if there are new input fields in the future where the value is supposed to be a string add their id here
    if (["comment"].includes(e.target.id)) {
      updatedComponent = { ...component, [e.target.id]: value };
    } else {
      if (e.target.id === "degreeOfCompletion") {
        const num = parseFloat(value);
        if (num < 0) value = "0";
        if (num > 1) value = "1";
      }
      updatedComponent = { ...component, [e.target.id]: value };
    }
    const updatedComponents = project.functionalComponents.map(functionalComponent => functionalComponent.id === component.id ? updatedComponent : functionalComponent);
    const updatedProject = { ...project, functionalComponents: updatedComponents };
    setProject(updatedProject);
  }

  return (
    <>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-4 border-2 border-fisma-gray bg-white my-5 w-full p-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              className="w-full border-2 border-fisma-gray bg-white p-2 text-sm sm:text-base"
              id="comment"
              placeholder={translation.commentPlaceholder}
              value={component.comment || ""}
              onChange={handleComponentChange}
              disabled={!isLatest}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-start sm:justify-end">
            <div className="flex gap-2 text-sm sm:text-base">
              <span>= {pointsByDegreeOfCompletion.toFixed(2)} {translation.functionalPointText}</span>
              <span>= {fullPoints.toFixed(2)} {translation.functionalPointReadyText}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCollapsed((prev) => !prev)}
                className="bg-fisma-blue hover:bg-fisma-dark-blue text-white py-2 px-3 cursor-pointer"
              >
                <FontAwesomeIcon icon={isCollapsed ? faCaretUp : faCaretDown} />
              </button>
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

        {isCollapsed && (
          <>
            <label className="font-medium">
              {translation.degreeOfCompletionPlaceholder}:
            </label>
            <input
              id="degreeOfCompletion"
              type="number"
              min={0.01}
              max={1}
              step={0.01}
              value={component.degreeOfCompletion || ""}
              onChange={handleComponentChange}
              className="border-2 border-fisma-light-gray bg-white min-w-[180px] max-w-[225px] p-2 text-base"
              placeholder="0"
              disabled={!isLatest}
            />

            <div className="flex flex-row flex-wrap gap-3 items-center">
              <select
                id="className"
                value={component.className || ""}
                onChange={handleClassNameChange}
                className="border-2 border-fisma-light-gray bg-white p-2 flex-1 min-w-[180px] text-base"
                disabled={!isLatest}
              >
                <option disabled value="">{translation.classNamePlaceholder}</option>
                {classNameOptions.map((className) => (
                  <option key={className} value={className}>
                    {translation.classNameOptions[className as ClassName]}
                  </option>
                ))}
              </select>

              {component.className && (
                <>
                  <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
                    <select
                      id="componentType"
                      value={component.componentType || ""}
                      onChange={handleOptionTypeChange}
                      className="border-2 border-fisma-light-gray bg-white p-2 text-base"
                      disabled={!isLatest}
                    >
                      <option disabled value="">
                        {translation.componentTypePlaceholder}
                      </option>
                      {componentTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {translation.componentTypeOptions[option as ComponentType]}
                        </option>
                      ))}
                    </select>

                  </div>
                </>
              )}
            </div>

            {component.className && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(component)
                  .filter(([key]) => inputFields.includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1 items-start">
                      <label htmlFor={key} className="font-medium">
                        {translation.parameters[key as CalculationParameter]}:
                      </label>
                      <input
                        id={key}
                        type="text"
                        placeholder="0"
                        value={value as number}
                        onChange={handleComponentChange}
                        className="w-[120px] border-2 border-fisma-light-gray bg-white p-2"
                      />
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </form>

      <ConfirmModal
        message={
          component.comment
            ? `${translation.confirmDeleteMessage} "${component.comment}?"`
            : `${translation.confirmDeleteMessage}?`
        }
        open={isConfirmModalOpen}
        setOpen={setConfirmModalOpen}
        onConfirm={() => deleteFunctionalComponent(component.id)}
      />
    </>
  );
}