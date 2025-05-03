import { TGenericComponent } from "./types.ts";

const calculateInteractiveEndUserNavigationAndQueryService = (functionalComponent: TGenericComponent) => {
  if (!functionalComponent.componentType) {
    throw new Error("ComponentType missing when calculateInteractiveEndUserNavigationAndQueryService");
  }

  const dataElements = functionalComponent.dataElements ?? 0;
  const readingReferences = functionalComponent.readingReferences ?? 0;

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

const calculateInteractiveEndUserInputService = (functionalComponent: TGenericComponent) => {
  if (!functionalComponent.componentType) {
    throw new Error("ComponentType missing when calculateInteractiveEndUserNavigationAndQueryService");
  }
  const dataElements = functionalComponent.dataElements ?? 0;
  const writingReferences = functionalComponent.writingReferences ?? 0;
  const readingReferences = functionalComponent.readingReferences ?? 0;

  //extract functionality multiplier from component type e.g. "1-tyyppinen" => 1, "2-tyyppinen" => 2 and so on
  const functionalityMultiplier = Number(functionalComponent.componentType.split("-")[0]);

  return functionalityMultiplier * (0.2 + (dataElements / 5) + (writingReferences / 1.5) + (readingReferences / 2));
}

const calculateNonInteractiveEndUserOutputService = (functionalComponent: TGenericComponent) => {
  const dataElements = functionalComponent.dataElements ?? 0;
  const readingReferences = functionalComponent.readingReferences ?? 0;

  return (1 + (dataElements / 5) + (readingReferences / 2));
}

const calculateInterfaceServiceToOtherApplications = (functionalComponent: TGenericComponent) => {
  const dataElements = functionalComponent.dataElements ?? 0;
  const readingReferences = functionalComponent.readingReferences ?? 0;
  return 0.5 + (dataElements / 7) + (readingReferences / 2);
}

const calculateInterfaceServiceFromOtherApplications = (functionalComponent: TGenericComponent) => {
  const dataElements = functionalComponent.dataElements ?? 0;
  const writingReferences = functionalComponent.writingReferences ?? 0;
  const readingReferences = functionalComponent.readingReferences ?? 0;

  return 0.2 + (dataElements / 5) + (writingReferences / 1.5) + (readingReferences / 2);
}

const calculateDataStorageService = (functionalComponent: TGenericComponent) => {
  const dataElements = functionalComponent.dataElements ?? 0;

  return 1.5 + (dataElements / 4);
}

const calculateAlgorithmicOrManipulationService = (functionalComponent: TGenericComponent) => {
  const dataElements = functionalComponent.dataElements ?? 0;
  const operations = functionalComponent.operations ?? 0;

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