import {
  TDataStorageService,
  TInteractiveEndUserInputService,
  TInteractiveEndUserNavigationAndQueryService,
  TNonInteractiveEndUserOutputService,
  TInterfaceServiceToOtherApplications,
  TInterfaceServiceFromOtherApplications,
  TAlgorithmicOrManipulationService
} from "./types.ts";

const calculateInteractiveEndUserNavigationAndQueryService = (functionalComponent: TInteractiveEndUserNavigationAndQueryService,) => {
  if (!functionalComponent.componentType) {
    throw new Error("ComponentType missing when calculateInteractiveEndUserNavigationAndQueryService");
  }

  const { dataElements, readingReferences } = functionalComponent;

  if (
    functionalComponent.componentType === "function designators" ||
    functionalComponent.componentType === "function lists" ||
    functionalComponent.componentType === "selection lists"
  ) {
    return (0.2 + (dataElements / 7) + (readingReferences / 2));
  } else {
    return (0.2 + ((dataElements + 1) / 7) + (readingReferences / 2));
  }
};

const calculateInteractiveEndUserInputService = (functionalComponent: TInteractiveEndUserInputService) => {
  if (!functionalComponent.componentType) {
    throw new Error("ComponentType missing when calculateInteractiveEndUserNavigationAndQueryService");
  }

  const { dataElements, writingReferences, readingReferences } = functionalComponent;

  //extract functionality multiplier from component type e.g. "1-tyyppinen" => 1, "2-tyyppinen" => 2 and so on
  const functionalityMultiplier = Number(functionalComponent.componentType.split("-")[0]);

  return functionalityMultiplier * (0.2 + (dataElements / 5) + (writingReferences / 1.5) + (readingReferences / 2));
}

const calculateNonInteractiveEndUserOutputService = (functionalComponent: TNonInteractiveEndUserOutputService) => {
  const { dataElements, readingReferences } = functionalComponent;

  return (1 + (dataElements / 5) + (readingReferences / 2));
}

const calculateInterfaceServiceToOtherApplications = (functionalComponent: TInterfaceServiceToOtherApplications) => {
  const { dataElements, readingReferences } = functionalComponent;

  return 0.5 + (dataElements / 7) + (readingReferences / 2);
}

const calculateInterfaceServiceFromOtherApplications = (functionalComponent: TInterfaceServiceFromOtherApplications) => {
  const { dataElements, writingReferences, readingReferences } = functionalComponent;

  return 0.2 + (dataElements / 5) + (writingReferences / 1.5) + (readingReferences / 2);
}

const calculateDataStorageService = (functionalComponent: TDataStorageService) => {
  const { dataElements } = functionalComponent;

  return 1.5 + (dataElements / 4);
}

const calculateAlgorithmicOrManipulationService = (functionalComponent: TAlgorithmicOrManipulationService) => {
  const { dataElements, operations } = functionalComponent;

  return 0.1 + (dataElements / 5) + (operations / 3);
}

export {
  calculateInteractiveEndUserNavigationAndQueryService,
  calculateInteractiveEndUserInputService,
  calculateNonInteractiveEndUserOutputService,
  calculateInterfaceServiceToOtherApplications,
  calculateInterfaceServiceFromOtherApplications,
  calculateDataStorageService,
  calculateAlgorithmicOrManipulationService
}