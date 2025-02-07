import { useState } from "react";
import * as React from "react";
import { classNameOptions } from "../lib/fc-constants.ts";
import { TGenericComponent } from "../lib/types.ts";
import {
  getCalculateFuntion,
  getComponentTypeOptions,
  getEmptyComponent,
  getResetedComponentWithClassName,
} from "../lib/fc-service-functions.ts";

type FunctionalClassComponentProps = {
  componentProp: TGenericComponent;
};

export default function FunctionalClassComponent({ componentProp }: FunctionalClassComponentProps) {
  const [component, setComponent] = useState<TGenericComponent>(componentProp);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const componentTypeOptions = getComponentTypeOptions(component.className || "");
  const calculateFunction = getCalculateFuntion((component.className && component.componentType) ? component.className : "");
  //@ts-expect-error(TODO - component should be typed before it goes to the calculation)
  const points = calculateFunction ? calculateFunction(component) : 0;

  const handleClassNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClassName = e.target.value;
    // component that doesn't have a className is an "empty"-comoponent
    if (newClassName === "") {
      setComponent((prev) => getEmptyComponent(prev));
      return;
    }
    // if className changes, component gets reseted (it has only className and ids)
    setComponent((prev) => getResetedComponentWithClassName(prev, newClassName));
  };

  const handleOptionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOptionType = e.target.value;
    if (newOptionType === "" && component.className) {
      setComponent((prev) => getResetedComponentWithClassName(prev, component.className as string));
    }
    setComponent((prev) => ({ ...prev, componentType: newOptionType || null }));
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5 border-3 my-5 rounded w-[800px] mx-10 p-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <select
            id="functionalClassSelection"
            value={component.className || ""}
            onChange={handleClassNameChange}
            className="w-52 border-2 border-gray-400 rounded p-1"
          >
            <option key="empty" disabled value="">Valitse toimintoluokka</option>
            {classNameOptions.map((className) => {
              return (
                <option key={className} value={className}>
                  {className}
                </option>
              );
            })}
          </select>

          {component.className && (
            <select
              id="functionalClassTypeOption"
              value={component.componentType || ""}
              onChange={handleOptionTypeChange}
              className="w-52 border-2 border-gray-400 rounded p-1"
            >
              <option key="empty" disabled value="">Valitse toimintotyyppi</option>
              <option key="empty" value="">Ei tyyppiä</option>
              {componentTypeOptions.map((option) => {
                return (
                  <option key={option} value={option}>
                    {option}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        <div className="flex gap-5 items-center">
          {/* Only show collapse button if class for row is selected */}
          {component.className && (
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="font-medium cursor-pointer"
            >
              <span className={`inline-block text-3xl ${isCollapsed ? "rotate-180" : "rotate-0"} transition-transform duration-300`}>
                ^
              </span>
            </button>
          )}

          <p>= {points} TP</p>
        </div>
      </div>

      {/* The rest of the options are only rendered if row has a selected type and it is collapsed */}
      {component.componentType && isCollapsed && (
        <div className="flex gap-10">
          {Object.entries(component)
            .filter(
              ([key, value]) =>
                !["id", "className", "componentType", "projectId"].includes(key) &&
                value !== null,
            )
            .map(([key, value]) => (
              <div key={key} className="flex flex-col gap-3 items-center">
                <label htmlFor={key}>{key}:</label>
                <input
                  id={key}
                  type="number"
                  value={value as number}
                  onChange={(e) =>
                    setComponent((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className="w-14 border-2 border-gray-400 rounded p-1"
                />
              </div>
            ))}
        </div>
      )}
    </form>
  );
}