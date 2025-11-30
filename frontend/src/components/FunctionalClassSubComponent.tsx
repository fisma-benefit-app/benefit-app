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
    <div className="bg-white border-l-4 border-blue-500 shadow-md rounded-r-lg p-4 mb-3">
      {!collapsed && (
        <>
          {/* Subcomponent Badge */}
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            {translation.multiLayerInterface}
          </div>

          {/* Name Section */}
          <div className="flex flex-row flex-wrap gap-2 items-center">
            <div className="flex flex-col gap-2 items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {component.title}
              </h3>
            </div>
          </div>
          {/* Metadata Section */}
          <div className="flex flex-row flex-wrap gap-2 items-end mt-3">
            <select
              id="className"
              value={component.className || ""}
              className="border-2 border-gray-300 bg-gray-50 p-2 flex-1 min-w-[180px] text-sm rounded-md cursor-not-allowed"
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
                  className="border-2 border-gray-300 bg-gray-50 p-2 text-sm rounded-md cursor-not-allowed"
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
            <div className="flex flex-wrap gap-4 bg-gray-50 border-2 border-gray-200 p-3 rounded-md mt-3">
              {Object.entries(component)
                .filter(([key]) => inputFields.includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-1 items-start">
                    <label
                      htmlFor={key}
                      className="font-medium text-sm text-gray-700"
                    >
                      {translation.parameters[key as CalculationParameter]}:
                    </label>
                    <input
                      id={key}
                      type="number"
                      value={(value as number) || ""}
                      readOnly
                      className="w-[120px] border-2 border-gray-300 bg-white p-2 rounded-md text-sm cursor-not-allowed"
                    />
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      {/* Progress Bar */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
          <span>
            {translation.functionalPointText}:{" "}
            {pointsByDegreeOfCompletion.toFixed(2)} (
            {fullPoints > 0
              ? ((pointsByDegreeOfCompletion / fullPoints) * 100).toFixed(1)
              : "0.0"}
            %)
          </span>
          <span>
            {translation.functionalPointReadyText}: {fullPoints.toFixed(2)}{" "}
            (100%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width:
                fullPoints > 0
                  ? `${(pointsByDegreeOfCompletion / fullPoints) * 100}%`
                  : "0%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
