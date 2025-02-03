import { useState } from "react";
import * as React from "react";
import { classNameOptions } from "../lib/fc-constants.ts";
import { TGenericComponent } from "../lib/types.ts";
import {
  getCalculateFuntion,
  getComponentTypeOptions,
  getEmptyComponent,
  getEmptyComponentWithoutType,
} from "../lib/fc-service-functions.ts";

type FunctionalClassComponentProps = {
  componentProp: TGenericComponent;
};

export default function FunctionalClassComponent({componentProp}: FunctionalClassComponentProps) {
  const [component, setComponent] = useState<TGenericComponent>(componentProp);

  const componentTypeOptions = getComponentTypeOptions(component.className || "");
  const calculateFunction = getCalculateFuntion((component.className && component.componentType) ? component.className : "");
  //@ts-expect-error(TODO - component should be typed before it goes to the calculation)
  const points = calculateFunction ? calculateFunction(component) : 0;

  const handleClassNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClassName = e.target.value;
    if (newClassName === "") {
      setComponent((prev) => getEmptyComponent(prev));
      return;
    }
    setComponent((prev) => getEmptyComponentWithoutType(prev, newClassName));
  };

  const handleOptionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOptionType = e.target.value;
    setComponent((prev) => ({ ...prev, componentType: newOptionType || null }));
  };

  return (
    <div className="mt-3">
      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="functionalClassSelection" className="mx-3">
          Valitse toimintoluokka:
        </label>
        <select
          id="functionalClassSelection"
          value={component.className || ""}
          onChange={handleClassNameChange}
        >
          <option key="empty" value=""></option>
          {classNameOptions.map((className) => {
            return (
              <option key={className} value={className}>
                {className}
              </option>
            );
          })}
        </select>

        <br />

        {component.className && (
          <>
            <label htmlFor="functionalClassTypeOption" className="mx-3">
              Valitse tyyppi
            </label>
            <select
              id="functionalClassTypeOption"
              value={component.componentType || ""}
              onChange={handleOptionTypeChange}
            >
              <option key="empty" value=""></option>
              {componentTypeOptions.map((option) => {
                return (
                  <option key={option} value={option}>
                    {option}
                  </option>
                );
              })}
            </select>
          </>
        )}

        {component.componentType && (
          <>
            {Object.entries(component)
              .filter(
                ([key, value]) =>
                  !["id", "className", "componentType", "projectId"].includes(key) &&
                  value !== null,
              )
              .map(([key, value]) => (
                <div key={key} className="mx-3">
                  <label htmlFor={key}>{key}</label>
                  <input
                    id={key}
                    type="number"
                    value={value as number}
                    onChange={(e) =>
                      setComponent((prev) => ({
                        ...prev,
                        [key]: +e.target.value,
                      }))
                    }
                    className="mx-3"
                  />
                </div>
              ))}
          </>
        )}
      </form>
      <><p>Pisteet: {points}</p></>
    </div>
  );
}