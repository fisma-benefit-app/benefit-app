import {  TGenericComponent } from "./types.ts";
import { calculateFunctions, componentTypeOptions } from "./fc-constants.ts";
import {componentTemplates} from "./fc-empty-templates.ts";

export const getComponentTypeOptions = (className: string) => {
  const options = componentTypeOptions.find((option) => option.className === className)?.componentTypeOptions;
  return options || [];
};

export const getCalculateFuntion = (className: string) => {
  const calculateFunction = calculateFunctions.find((calculate) => calculate.className === className)?.calculateFunction;
  return calculateFunction || null;
};


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
    projectId: component.projectId,
  };
};

//todo: does selecting new class override degree of completion and comment for the row or not?
export const getResetedComponentWithClassName = (component: TGenericComponent, newClassName: string) => {
  const resetedComponentWithClassName = componentTemplates.find((template) => template.className === newClassName)?.resetedComponentWithClassName;
  if (!resetedComponentWithClassName) {
    throw new Error("Something went wrong when creating functional-component without type");
  }
  return {...resetedComponentWithClassName, id: component.id, projectId: component.projectId};
}
