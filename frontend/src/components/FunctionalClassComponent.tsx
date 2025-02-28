import * as React from "react";
import { useEffect, useState } from "react";
import { classNameOptions, parameterDisplayNames, TParameterDisplayNames } from "../lib/fc-constants.ts";
import { getCalculateFuntion, getComponentTypeOptions, getEmptyComponent, getResetedComponentWithClassName } from "../lib/fc-service-functions.ts";
import { TGenericComponent, Project } from "../lib/types.ts";

type FunctionalClassComponentProps = {
  componentProp: TGenericComponent;
  deleteFunctionalComponent: (componentId: number) => Promise<void>;
  project: Project | null,
  setProject: React.Dispatch<React.SetStateAction<Project | null>>
};

export default function FunctionalClassComponent({ componentProp, deleteFunctionalComponent, project, setProject }: FunctionalClassComponentProps) {

  const [component, setComponent] = useState<TGenericComponent>(componentProp);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const componentTypeOptions = getComponentTypeOptions(component.className || "");

  //todo: does the user need to explicitly select component type for points to be calculated?
  const calculateFunction = getCalculateFuntion((component.className && component.componentType) ? component.className : "");

  //@ts-expect-error(TODO - component should be typed before it goes to the calculation).
  const points = calculateFunction ? calculateFunction(component) : 0;

  const handleClassNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClassName = e.target.value;
    // Component that doesn't have a className is an "empty"-component, 
    // this is used for id generation in backend.
    if (newClassName === "") {
      setComponent((prev) => getEmptyComponent(prev));
      return;
    }
    // If className changes, component gets reseted (it has only className and ids).
    setComponent((prev) => getResetedComponentWithClassName(prev, newClassName));
  };

  const handleOptionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOptionType = e.target.value;
    if (newOptionType === "" && component.className) {
      setComponent((prev) => getResetedComponentWithClassName(prev, component.className as string));
    }
    setComponent((prev) => ({ ...prev, componentType: newOptionType || null }));
  };

  //this is a first attempt to get whole project saving working, there is probably a better way which we should discuss
  useEffect(() => {
    if (project) {
      const componentsWithUpdatedComponent = project.functionalComponents.map(functionalComponent => functionalComponent.id === component.id ? component : functionalComponent);
      const projectWithUpdatedcomponent: Project = { ...project, functionalComponents: componentsWithUpdatedComponent };
      setProject(projectWithUpdatedcomponent);
    }
  }, [component])

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3 border-2 bg-[#fafaf5] my-5 rounded-2xl w-[1075px] p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <select
            id="functionalClassSelection"
            value={component.className || ""}
            onChange={handleClassNameChange}
            className="w-52 border-2 border-gray-400 rounded-xl p-1"
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
                id="functionalClassTypeOption"
                value={component.componentType || ""}
                onChange={handleOptionTypeChange}
                className="w-52 border-2 border-gray-400 rounded-xl p-1"
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
                className="w-36 border-2 border-gray-400 p-1 rounded-xl"
                id="degreeOfCompletion"
                placeholder="Valmistumisaste"
                type="number"
                min={0.01}
                max={1}
                step={0.01}
                value={component.degreeOfCompletion || ""}
                onChange={(e) =>
                  setComponent((prev) => ({
                    ...prev,
                    degreeOfCompletion: Number(e.target.value),
                  }))
                }
              />
            </>
          )}
        </div>

        <div className="flex gap-4 items-center">
          {/* todo: now calculate logic blends into render logic. This is not good. 
          Need to move up component (to derived state). */}
          <p>= {((component.degreeOfCompletion || 0) * points).toFixed(2)} TP</p>
          <p>= {points.toFixed(2)} TP (valmis)</p>
          {/* Only show collapse button if class for row is selected */}
          {component.className && (
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="flex text-white py-1 px-3 rounded items-center gap-1 bg-sky-600 hover:bg-sky-700 cursor-pointer"
            >
              <span className={`inline-block text-1xl ${isCollapsed ? "rotate-180" : "rotate-0"} transition-transform duration-300`}>
                ^
              </span>
            </button>
          )}
          <button
            className="bg-red-500 hover:bg-red-600 cursor-pointer text-white py-1 px-3 rounded"
            onClick={() => deleteFunctionalComponent(component.id)}
          >
            X
          </button>
        </div>
      </div>

      <div>
        <input
          className="w-full border-2 border-gray-400 p-1 rounded-xl"
          id="comment"
          placeholder="Kommentti."
          value={component.comment || ""}
          onChange={(e) =>
            setComponent((prev) => ({
              ...prev,
              comment: e.target.value,
            }))
          }
        />
      </div>

      {/* The rest of the options are only rendered 
      if row has a selected type and it is collapsed */}
      {component.className && isCollapsed && (
        <div className="flex gap-10">
          {Object.entries(component)
            .filter(
              ([key, value]) =>
                !["id", "className", "componentType", "degreeOfCompletion", "comment", "projectId", "functionalMultiplier"].includes(key) &&
                value !== null,
            )
            .map(([key, value]) => (
              <div key={key} className="flex flex-col gap-2 items-center">
                {/* Display finnish name for parameters */}
                <label htmlFor={key}>{parameterDisplayNames[key as keyof TParameterDisplayNames]}:</label>
                <input
                  className="w-16 border-2 border-gray-400 p-1 rounded-xl"
                  id={key}
                  type="number"
                  value={value as number}
                  onChange={(e) =>
                    setComponent((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
        </div>
      )}
    </form>
  );
}