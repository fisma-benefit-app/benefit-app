import { faCaretDown, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChangeEvent, useState } from "react";
import { classNameOptions, parameterDisplayNames, TParameterDisplayNames } from "../lib/fc-constants.ts";
import { getCalculateFuntion, getComponentTypeOptions, getEmptyComponent, getResetedComponentWithClassName } from "../lib/fc-service-functions.ts";
import { Project, TGenericComponent } from "../lib/types.ts";

type FunctionalClassComponentProps = {
  component: TGenericComponent;
  deleteFunctionalComponent: (componentId: number) => Promise<void>;
  project: Project,
  setProject: React.Dispatch<React.SetStateAction<Project | null>>
};

export default function FunctionalClassComponent({ component, deleteFunctionalComponent, project, setProject }: FunctionalClassComponentProps) {

  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const componentTypeOptions = getComponentTypeOptions(component.className || "");

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
      updatedComponents = project.functionalComponents.map(functionalComponent => functionalComponent.id === component.id ? getResetedComponentWithClassName(component, newClassName) : functionalComponent);
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

    //check if the updated attribute needs to be converted to a number for math
    //todo: if there are new input fields in the future where the value is supposed to be a string add their id here
    if (["comment"].includes(e.target.id)) {
      updatedComponent = { ...component, [e.target.id]: e.target.value };
    } else {
      updatedComponent = { ...component, [e.target.id]: Number(e.target.value) };
    }
    const updatedComponents = project.functionalComponents.map(functionalComponent => functionalComponent.id === component.id ? updatedComponent : functionalComponent);
    const updatedProject = { ...project, functionalComponents: updatedComponents };
    setProject(updatedProject);
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3 border-2 border-fisma-dark-blue bg-white my-5 w-[1075px] p-4">
      <div className="flex gap-5 items-center justify-between">
        <div className="flex-1">
          <input
            className="w-full border-2 border-gray-400 p-1"
            id="comment"
            placeholder="Toiminnon nimi"
            value={component.comment || ""}
            onChange={handleComponentChange}
          />
        </div>

        <div className="flex gap-4 items-center">
          <p>= {pointsByDegreeOfCompletion.toFixed(2)} TP</p>
          <p>= {fullPoints.toFixed(2)} TP (Valmis)</p>
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="bg-fisma-blue hover:bg-fisma-dark-blue cursor-pointer rounded text-white py-1 px-3 items-center gap-1"
          >
            <span className={`inline-block text-1xl ${isCollapsed ? "rotate-180" : "rotate-0"} transition-transform duration-300`}>
              <FontAwesomeIcon icon={faCaretDown} />
            </span>
          </button>
          <button
            className="bg-fisma-red hover:brightness-130 cursor-pointer rounded text-white py-1 px-3"
            onClick={() => deleteFunctionalComponent(component.id)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      {isCollapsed && (
        <>
          <div className="flex w-full gap-2 items-center">
            <select
              id="className"
              value={component.className || ""}
              onChange={handleClassNameChange}
              className="flex-content border-2 border-gray-400 p-1"
            >
              <option disabled value="">Valitse toimintoluokka</option>
              {classNameOptions.map((className) => {
                return (
                  <option key={className.value} value={className.value}>
                    {className.displayName}
                  </option>
                );
              })}
            </select>

            {/* Show option for component type and degree of completion 
                only if component class is selected first */}
            {component.className && (
              <>
                <select
                  id="componentType"
                  value={component.componentType || ""}
                  onChange={handleOptionTypeChange}
                  className="flex-content border-2 border-gray-400 p-1"
                >
                  <option disabled value="">Valitse toimintotyyppi</option>
                  {/* todo: add option for no component type if needed */}
                  {componentTypeOptions.map((option) => {
                    return (
                      <option key={option.value} value={option.value}>
                        {option.displayName}
                      </option>
                    );
                  })}
                </select>

                <input
                  className="w-40 border-2 border-gray-400 p-1"
                  id="degreeOfCompletion"
                  placeholder="Valmistumisaste"
                  type="number"
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={component.degreeOfCompletion || ""}
                  onChange={handleComponentChange}
                />
              </>
            )}
          </div>

          {/* The rest of the options are only rendered 
              if component class is selected */}
          {component.className && (
            <div className="flex gap-10">
              {Object.entries(component)
                .filter(
                  ([key, value]) =>
                    ["dataElements", "readingReferences", "writingReferences", "operations"].includes(key) &&
                    value !== null,
                )
                .map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-2 items-center">
                    {/* Display finnish name for parameters */}
                    <label htmlFor={key}>{parameterDisplayNames[key as keyof TParameterDisplayNames]}:</label>
                    <input
                      className="w-16 border-2 border-gray-400 p-1"
                      id={key}
                      type="text"
                      value={value as number}
                      onChange={handleComponentChange}
                    />
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </form>
  );
}