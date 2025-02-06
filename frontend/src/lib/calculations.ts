import {
  TDataStrorageService,
  TInteractiveEndUserInputService,
  TInteractiveEndUserNavigatioinAndQueryService
} from "./types.ts";

export const calculateInteractiveEndUserNavigationAndQueryService = (
  functionalComponent: TInteractiveEndUserNavigatioinAndQueryService,
) => {
  if (!functionalComponent.componentType) {
    throw new Error("ComponentType missing when calculateInteractiveEndUserNavigationAndQueryService");
  }

  if (
    functionalComponent.componentType === "function designators" ||
    functionalComponent.componentType === "function lists" ||
    functionalComponent.componentType === "selection lists"
  ) {
    return (
      0.2 +
      functionalComponent.dataElements / 7 +
      functionalComponent.readingReferences / 2
    );
  } else {
    return (
      0.2 +
      (functionalComponent.dataElements +
        1 +
        functionalComponent.readingReferences / 2)
    );
  }
};

export const calculateInteractiveEndUserInputService = (functionalComponent: TInteractiveEndUserInputService) => {
  if (!functionalComponent.componentType) {
    throw new Error("ComponentType missing when calculateInteractiveEndUserInputService");
  }

  const functionalityMultiplier = Number(functionalComponent.componentType.split("-")[0]);

  return functionalityMultiplier * (0.2 + (functionalComponent.dataElements / 5) + (functionalComponent.writingReferences / 1.5) + (functionalComponent.readingReferences / 2));
}


export const calculateDataStorageService = (functionalComponent: TDataStrorageService) => {
  return 1.5 + (functionalComponent.dataElements / 4);
}
