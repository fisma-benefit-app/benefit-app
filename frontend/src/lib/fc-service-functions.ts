import {
  calculateFunctions,
  componentTypeOptions,
  componentClassFields,
} from "./fc-constants.ts";
import { ClassName, TGenericComponent } from "./types.ts";

export const getComponentTypeOptions = (className: ClassName) => {
  const options = componentTypeOptions.find(
    (option) => option.className === className,
  )?.componentTypeOptions;
  return options || [];
};

export const getCalculateFunction = (className: ClassName | string) => {
  const calculateFunction = calculateFunctions.find(
    (calculate) => calculate.className === className,
  )?.calculateFunction;
  return calculateFunction || null;
};

export const getInputFields = (className: ClassName) => {
  const inputFields = componentClassFields.find(
    (option) => option.className === className,
  )?.inputFields;
  return inputFields || [];
};

export const getClosestCompletionOption = (degree: number): string => {
  if (degree >= 0.01 && degree <= 0.29) return "0.1"; // 0.01-0.29 → specified
  if (degree >= 0.3 && degree <= 0.69) return "0.3"; // 0.3-0.69 → planned
  if (degree >= 0.7 && degree <= 0.89) return "0.7"; // 0.7-0.89 → implemented
  if (degree >= 0.9 && degree <= 0.99) return "0.9"; // 0.9-0.99 → tested
  return "1"; // 1.0 → ready for use
};

export const isMultiLayerArchitectureComponent = (
  component: TGenericComponent,
) => {
  if (
    ["Interactive end-user input service", "Data storage service"].includes(
      component.className,
    ) ||
    (component.className ===
      "Interactive end-user navigation and query service" &&
      [
        "browsing lists",
        "data inquiries",
        "generation indicators",
        "log-in log-out functions",
      ].includes(component.componentType || ""))
  ) {
    return true;
  }
  return false;
};
