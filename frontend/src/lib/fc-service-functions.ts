import {
  calculateFunctions,
  componentTypeOptions,
  componentClassFields,
} from "./fc-constants.ts";
import { ClassName } from "./types.ts";

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
