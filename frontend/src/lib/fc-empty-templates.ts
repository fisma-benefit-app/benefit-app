import {
  TDataStrorageService,
  TInteractiveEndUserInputService,
  TInteractiveEndUserNavigatioinAndQueryService,
  TNonInteractiveEndUserOutputService,
  TInterfaceServiceToOtherApplications,
  TInterfaceServiceFromOtherApplications,
  TAlgorithmicOrManipulationService
} from "./types.ts";

export const componentTemplates = [
  {
    className: "Interactive end-user navigation and query service",
    resetedComponentWithClassName: {
      id: 0, // TODO - better option than 0?
      className: "Interactive end-user navigation and query service",
      componentType: null,
      dataElements: 0,
      readingReferences: 0,
      writingReferences: null,
      functionalMultiplier: null,
      operations: null,
      projectId: 0, // TODO - better option than 0?
    } as TInteractiveEndUserNavigatioinAndQueryService
  },
  {
    className: "Interactive end-user input service",
    resetedComponentWithClassName: {
      id: 0,
      className: "Interactive end-user input service",
      componentType: null,
      dataElements: 0,
      readingReferences: 0,
      writingReferences: 0,
      functionalMultiplier: null,
      operations: null,
      projectId: 0,
    } as TInteractiveEndUserInputService,
  },
  {
    className: "Data storage service",
    resetedComponentWithClassName: {
      id: 0,
      className: "Data storage service",
      componentType: null,
      dataElements: 0,
      readingReferences: null,
      writingReferences: null,
      functionalMultiplier: null,
      operations: null,
      projectId: 0,
    } as TDataStrorageService,
  },
  {
    className: "Non-interactive end-user output service",
    resetedComponentWithClassName: {
      id: 0,
      className: "Non-interactive end-user output service",
      componentType: null,
      dataElements: 0,
      readingReferences: 0,
      writingReferences: null,
      functionalMultiplier: null,
      operations: null,
      projectId: 0,
    } as TNonInteractiveEndUserOutputService,
  },
  {
    className: "Interface service to other applications",
    resetedComponentWithClassName: {
      id: 0,
      className: "Interface service to other applications",
      componentType: null,
      dataElements: 0,
      readingReferences: 0,
      writingReferences: null,
      functionalMultiplier: null,
      operations: null,
      projectId: 0,
    } as TInterfaceServiceToOtherApplications,
  },
  {
    className: "Interface service from other applications",
    resetedComponentWithClassName: {
      id: 0,
      className: "Interface service from other applications",
      componentType: null,
      dataElements: 0,
      readingReferences: 0,
      writingReferences: 0,
      functionalMultiplier: null,
      operations: null,
      projectId: 0,
    } as TInterfaceServiceFromOtherApplications,
  },
  {
    className: "Algorithmic or manipulation service",
    resetedComponentWithClassName: {
      id: 0,
      className: "Algorithmic or manipulation service",
      componentType: null,
      dataElements: 0,
      readingReferences: null,
      writingReferences: null,
      functionalMultiplier: null,
      operations: 0,
      projectId: 0,
    } as TAlgorithmicOrManipulationService,
  }
];
