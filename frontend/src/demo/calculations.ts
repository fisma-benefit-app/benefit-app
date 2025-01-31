const calculateInteractiveEndUserNavigationAndQueryService = (baseFunctionalComponentType: string, dataElements: number, readingReferences: number) => {
    if (baseFunctionalComponentType === "function designators" ||
        baseFunctionalComponentType === "function lists" ||
        baseFunctionalComponentType === "selection lists") {
        return 0.2 + (dataElements / 7) + (readingReferences / 2);
    } else {
        return 0.2 + ((dataElements + 1) / 7) + (readingReferences / 2);
    }
}

const calculateInteractiveEndUserInputService = (baseFunctionalComponentType: string, dataElements: number, writingReferences: number, readingReferences: number) => {
    const functionalityMultiplier = Number(baseFunctionalComponentType.split("-")[0]);
    return functionalityMultiplier * (0.2 + (dataElements / 5) + (writingReferences / 1.5) + (readingReferences / 2));
}

const calculateNonInteractiveEndUserOutputService = (dataElements: number, readingReferences: number) => {
    return (1 + (dataElements / 5) + (readingReferences / 2));
}

const calculateInterfaceServiceToOtherApplications = (dataElements: number, readingReferences: number) => {
    return 0.5 + (dataElements / 7) + (readingReferences / 2);
}

const calculateInterfaceServiceFromOtherApplications = (dataElements: number, writingReferences: number, readingReferences: number) => {
    return 0.2 + (dataElements / 5) + (writingReferences / 1.5) + (readingReferences / 2);
}

const calculateDataStorageService = (dataElements: number) => {
    return 1.5 + (dataElements / 4);
}

const calculateAlgorithmicOrManipulationService = (dataElements: number, operations: number) => {
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