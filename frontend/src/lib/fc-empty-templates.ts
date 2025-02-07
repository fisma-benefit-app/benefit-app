import {
  TDataStrorageService,
  TInteractiveEndUserInputService, TInteractiveEndUserNavigatioinAndQueryService,
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
];
