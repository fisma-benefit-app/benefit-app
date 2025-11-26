import useTranslations from "../hooks/useTranslations.ts";
import { classNameOptions } from "../lib/fc-constants.ts";
import {
  getComponentTypeOptions,
  getInputFields,
} from "../lib/fc-service-functions.ts";
import {
  calculateBasePoints,
  calculateComponentPoints,
} from "../lib/centralizedCalculations.ts";
import { CalculationParameter, TGenericComponent } from "../lib/types.ts";

type FunctionalClassSubComponentProps = {
  component: TGenericComponent;
  collapsed: boolean;
};

export default function FunctionalClassSubComponent({
  component,
  collapsed,
}: FunctionalClassSubComponentProps) {
  const translation = useTranslations().functionalClassComponent;

  const componentTypeOptions = getComponentTypeOptions(component.className);
  const inputFields = getInputFields(component.className);

  // Calculate functional points using centralized calculations
  const fullPoints = calculateBasePoints(component);
  const pointsByDegreeOfCompletion = calculateComponentPoints(component);

  return (
    <>
      {!collapsed && (
        <>
          {/* Metadata Section */}
          <div className="flex flex-row flex-wrap gap-3 items-center">
            <select
              id="className"
              value={component.className || ""}
              className="mt-6 border-2 border-fisma-light-gray bg-white p-2 flex-1 min-w-[180px] text-base rounded-md"
              disabled
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
                  className="border-2 border-fisma-light-gray bg-white p-2 text-base rounded-md"
                  disabled
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
                      readOnly
                      className="w-[120px] border-2 border-fisma-light-gray bg-white p-2 rounded-md"
                    />
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      <div className="mt-4 border-t pt-2 text-sm sm:text-base flex justify-between text-fisma-blue font-semibold">
        <span>
          {translation.functionalPointText}:{" "}
          {pointsByDegreeOfCompletion.toFixed(2)}
        </span>
        <span>
          {translation.functionalPointReadyText}: {fullPoints.toFixed(2)}
        </span>
      </div>
    </>
  );
}
