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
    projectId: component.projectId,
  };
};

export const getEmptyComponentWithoutType = (component: TGenericComponent, newClassName: string) => {
  const emptyComponentWithoutType = componentTemplates.find((template) => template.className === newClassName)?.componentWithoutTypeTemplate;
  if (!emptyComponentWithoutType) {
    throw new Error("Something went wrong when creating functional-component without type");
  }
  return {...emptyComponentWithoutType, id: component.id, projectId: component.projectId};
}
