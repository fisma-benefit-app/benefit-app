import {
  calculateFunctions,
  componentTypeOptions,
  componentClassFields,
  mlaInputAndStorageClassNames,
  mlaNavigationAndQueryClassName,
  mlaNavigationAndQueryComponentTypes,
} from "./fc-constants.ts";
import { ClassName, MLAsubComponent, TGenericComponent } from "./types.ts";

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
  return (
    mlaInputAndStorageClassNames.includes(component.className) ||
    (mlaNavigationAndQueryClassName === component.className &&
      mlaNavigationAndQueryComponentTypes.includes(
        component.componentType || "",
      ))
  );
};

export const createSubComponents = (
  parentComponent: TGenericComponent,
): MLAsubComponent[] => {
  const subComponentTypes: MLAsubComponent["subComponentType"][] = [
    "presentation",
    "businessLogic",
    "dataAccess",
    "integration",
  ];

  return subComponentTypes.map((type, index) => ({
    title: `${parentComponent.title || "Untitled"} - ${type}`,
    description: parentComponent.description,
    className: parentComponent.className,
    componentType: parentComponent.componentType,
    dataElements: parentComponent.dataElements,
    readingReferences: parentComponent.readingReferences,
    writingReferences: parentComponent.writingReferences,
    functionalMultiplier: parentComponent.functionalMultiplier,
    operations: parentComponent.operations,
    degreeOfCompletion: parentComponent.degreeOfCompletion,
    previousFCId: null,
    orderPosition: parentComponent.orderPosition,
    isMLA: false,
    id: -( (parentComponent.id ?? 0) * 1000 + index + 1 ), // Always use negative temporary ID to avoid collision,
    parentFCId: parentComponent.id,
    subComponentType: type,
    isReadonly: true as const,
    subComponents: undefined as never,
  }));
};

export const updateSubComponents = (
  parentComponent: TGenericComponent,
  existingSubComponents: MLAsubComponent[],
): MLAsubComponent[] => {
  return existingSubComponents.map((subComp) => ({
    id: subComp.id,
    title: `${parentComponent.title} - ${subComp.subComponentType}`,
    description: parentComponent.description,
    className: parentComponent.className,
    componentType: parentComponent.componentType,
    dataElements: parentComponent.dataElements,
    readingReferences: parentComponent.readingReferences,
    writingReferences: parentComponent.writingReferences,
    functionalMultiplier: parentComponent.functionalMultiplier,
    operations: parentComponent.operations,
    degreeOfCompletion: parentComponent.degreeOfCompletion,
    previousFCId: null,
    orderPosition: parentComponent.orderPosition,
    isMLA: false,
    parentFCId: subComp.parentFCId,
    subComponentType: subComp.subComponentType,
    isReadonly: true as const,
    subComponents: undefined as never,
  }));
};
