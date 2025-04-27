import {  TGenericComponent } from "./types.ts";
import { calculateFunctions, componentTypeOptions, componentClassFields } from "./fc-constants.ts";
import {componentTemplates} from "./fc-empty-templates.ts";

export const getComponentTypeOptions = (className: string) => {
  const options = componentTypeOptions.find((option) => option.className === className)?.componentTypeOptions;
  return options || [];
};

export const getCalculateFuntion = (className: string) => {
  const calculateFunction = calculateFunctions.find((calculate) => calculate.className === className)?.calculateFunction;
  return calculateFunction || null;
};

export const getInputFields = (className: string) => {
  const inputFields = componentClassFields.find(option => option.className === className)?.inputFields;
  return inputFields || [];
}

export const getEmptyComponent = (component: TGenericComponent) => {
  return {
    id: component.id,
    className: null,
    componentType: null,
    dataElements: null,
    readingReferences: null,
    writingReferences: null,
    functionalMultiplier: null,
    operations: null,
    degreeOfCompletion: null,
    comment: null,
    previousFCId: null,
    projectId: component.projectId,
  };
};

//TODO: better name? Proper past tense is also reset
export const getResetedComponentWithClassName = (component: TGenericComponent, newClassName: string) => {
  const resetedComponentWithClassName = componentTemplates.find((template) => template.className === newClassName)?.resetedComponentWithClassName;
  if (!resetedComponentWithClassName) {
    throw new Error("Something went wrong when creating functional-component without type");
  }
  return {...resetedComponentWithClassName, id: component.id, projectId: component.projectId, comment: component.comment, degreeOfCompletion: component.degreeOfCompletion};
}
