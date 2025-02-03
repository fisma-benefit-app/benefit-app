import {
  TDataStrorageService,
  TInteractiveEndUserInputService, TInteractiveEndUserNavigatioinAndQueryService,
} from "./types.ts";

export const componentTemplates = [
  {
    className: "Interactive end-user navigation and query service",
    componentWithoutTypeTemplate: {
      id: 0,
      className: "Interactive end-user navigation and query service",
      componentType: null,
      dataElements: 0,
      readingReferences: 0,
      writingReferences: null,
      functionalMultiplier: null,
      operations: null,
      projectId: 0,
    } as TInteractiveEndUserNavigatioinAndQueryService
  },
  {
    className: "Interactive end-user input service",
    componentWithoutTypeTemplate: {
      id: 0, // TODO - 0 is probably evil here
      className: "Interactive end-user input service",
      componentType: null,
      dataElements: 0,
      readingReferences: 0,
      writingReferences: 0,
      functionalMultiplier: 0,
      operations: null,
      projectId: 0,
    } as TInteractiveEndUserInputService,
  },
  {
    className: "Data storage service",
    componentWithoutTypeTemplate: {
      id: 0, // TODO - 0 is probably evil here
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
];
