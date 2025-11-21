import {
  calculateFunctions,
  componentTypeOptions,
  componentClassFields,
  mlaInputAndStorageClassNames,
  mlaNavigationAndQueryClassName,
  mlaNavigationAndQueryComponentTypes,
  interactiveServiceSendingUIB,
  interactiveServiceReceivingUIB,
  interactiveServiceSendingBUI,
  interactiveServiceReceivingBUI,
  dataStorageServiceSendingBD,
  dataStorageServiceReceivingBD,
  dataStorageServiceSendingDB,
  dataStorageServiceReceivingDB,
  componentParameterResetMap,
} from "./fc-constants.ts";
import { calculateReferencesSum } from "./centralizedCalculations.ts";
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

// This resets a functional component's parameters if parameters are not used in component's calculations
export const resetFunctionalComponentParameters = (
  component: TGenericComponent,
): TGenericComponent => {
  const parametersToReset = componentParameterResetMap[component.className];
  if (parametersToReset) {
    return {
      ...component,
      ...Object.fromEntries(
        parametersToReset.map((parameter) => [parameter, null]),
      ),
    };
  }
  return component;
};

export const createSubComponents = (
  parentComponent: TGenericComponent,
): MLAsubComponent[] => {
  const getSubComponents = (className: ClassName): MLAsubComponent[] => {
    if (className === "Data storage service") {
      return [
        dataStorageServiceSendingBD,
        dataStorageServiceReceivingBD,
        dataStorageServiceSendingDB,
        dataStorageServiceReceivingDB,
      ];
    }

    if (
      [
        "Interactive end-user navigation and query service",
        "Interactive end-user input service",
      ].includes(className)
    ) {
      return [
        interactiveServiceSendingUIB,
        interactiveServiceReceivingUIB,
        {
          // for this type of subcomponent, reading references are calculated from parent component's references
          ...interactiveServiceSendingBUI,
          readingReferences: calculateReferencesSum(parentComponent),
        },
        {
          // for this type of subcomponent, writing references are calculated from parent component's references
          ...interactiveServiceReceivingBUI,
          writingReferences: calculateReferencesSum(parentComponent),
        },
      ];
    }

    return [];
  };

  const subComponents = getSubComponents(parentComponent.className);

  return subComponents.map((subComp: MLAsubComponent, index) => ({
    title: `${parentComponent.title || "Untitled"}-${subComp.subComponentType}`,
    description: parentComponent.description,
    className: subComp.className,
    componentType: subComp.componentType,
    dataElements: parentComponent.dataElements,
    readingReferences: subComp.readingReferences,
    writingReferences: subComp.writingReferences,
    functionalMultiplier: parentComponent.functionalMultiplier,
    operations: parentComponent.operations,
    degreeOfCompletion: parentComponent.degreeOfCompletion,
    previousFCId: null,
    orderPosition: parentComponent.orderPosition,
    isMLA: false,
    id: -((parentComponent.id ?? 0) * 1000 + index + 1), // Always use negative temporary ID to avoid collision,
    parentFCId: parentComponent.id,
    subComponentType: subComp.subComponentType,
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
    title: `${parentComponent.title}-${subComp.subComponentType}`,
    description: parentComponent.description,
    className: subComp.className,
    componentType: subComp.componentType,
    dataElements: parentComponent.dataElements,
    readingReferences: recalculateReadingReferences(parentComponent, subComp),
    writingReferences: recalculateWritingReferences(parentComponent, subComp),
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

/*
 * According to the business requirements, reading references in some subcomponents are a calculated sum of the parent component's reading and writing references
 * This function recalculates the subcomponent's reading references value when parent component's reading or writing references values change
 */
export const recalculateReadingReferences = (
  parentComponent: TGenericComponent,
  subComp: MLAsubComponent,
): number | null => {
  if (
    [
      "Interactive end-user navigation and query service",
      "Interactive end-user input service",
    ].includes(parentComponent.className) &&
    subComp.className === "Interface service to other applications" &&
    subComp.subComponentType === "B-UI"
  ) {
    return calculateReferencesSum(parentComponent);
  }

  return subComp.readingReferences;
};

/*
 * According to the business requirements, writing references in some subcomponents are a calculated sum of the parent component's reading and writing references.
 * This function recalculates the subcomponent's writing references value when parent component's reading or writing references values change
 */
export const recalculateWritingReferences = (
  parentComponent: TGenericComponent,
  subComp: MLAsubComponent,
): number | null => {
  if (
    [
      "Interactive end-user navigation and query service",
      "Interactive end-user input service",
    ].includes(parentComponent.className) &&
    subComp.className === "Interface service from other applications" &&
    subComp.subComponentType === "B-UI"
  ) {
    return calculateReferencesSum(parentComponent);
  }

  return subComp.writingReferences;
};
