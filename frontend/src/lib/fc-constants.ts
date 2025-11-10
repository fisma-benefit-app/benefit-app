import {
  calculateDataStorageService,
  calculateInteractiveEndUserInputService,
  calculateNonInteractiveEndUserOutputService,
  calculateInterfaceServiceToOtherApplications,
  calculateInterfaceServiceFromOtherApplications,
  calculateInteractiveEndUserNavigationAndQueryService,
  calculateAlgorithmicOrManipulationService,
} from "./calculations.ts";
import { ClassName, ComponentType } from "./types.ts";

export const componentClassFields = [
  {
    className: "Interactive end-user navigation and query service",
    inputFields: ["dataElements", "readingReferences"],
  },
  {
    className: "Interactive end-user input service",
    inputFields: ["dataElements", "writingReferences", "readingReferences"],
  },
  {
    className: "Non-interactive end-user output service",
    inputFields: ["dataElements", "readingReferences"],
  },
  {
    className: "Interface service to other applications",
    inputFields: ["dataElements", "readingReferences"],
  },
  {
    className: "Interface service from other applications",
    inputFields: ["dataElements", "writingReferences", "readingReferences"],
  },
  {
    className: "Data storage service",
    inputFields: ["dataElements"],
  },
  {
    className: "Algorithmic or manipulation service",
    inputFields: ["dataElements", "operations"],
  },
];

export const classNameOptions: ClassName[] = [
  "Interactive end-user navigation and query service",
  "Interactive end-user input service",
  "Non-interactive end-user output service",
  "Interface service to other applications",
  "Interface service from other applications",
  "Data storage service",
  "Algorithmic or manipulation service",
];

type ComponentTypeOptions = {
  className: ClassName;
  componentTypeOptions: ComponentType[];
};

export const componentTypeOptions: ComponentTypeOptions[] = [
  {
    className: "Interactive end-user navigation and query service",
    componentTypeOptions: [
      "function designators",
      "log-in log-out functions",
      "function lists",
      "selection lists",
      "data inquiries",
      "generation indicators",
      "browsing lists",
    ],
  },
  {
    className: "Interactive end-user input service",
    componentTypeOptions: ["1-functional", "2-functional", "3-functional"],
  },
  {
    className: "Non-interactive end-user output service",
    componentTypeOptions: [
      "forms",
      "emails for text messages",
      "monitor screens",
    ],
  },
  {
    className: "Interface service to other applications",
    componentTypeOptions: [
      "messages to other applications",
      "batch records to other applications",
      "signals to devices or other applications",
    ],
  },
  {
    className: "Interface service from other applications",
    componentTypeOptions: [
      "messages from other applications",
      "batch records from other applications",
      "signals from devices or other applications",
    ],
  },
  {
    className: "Data storage service",
    componentTypeOptions: ["entities or classes", "other record types"],
  },
  {
    className: "Algorithmic or manipulation service",
    componentTypeOptions: [
      "security routines",
      "calculation routines",
      "simulation routines",
      "formatting routines",
      "database cleaning routines",
      "other manipulation routines",
    ],
  },
];

export const calculateFunctions = [
  {
    className: "Interactive end-user navigation and query service",
    calculateFunction: calculateInteractiveEndUserNavigationAndQueryService,
  },
  {
    className: "Interactive end-user input service",
    calculateFunction: calculateInteractiveEndUserInputService,
  },
  {
    className: "Non-interactive end-user output service",
    calculateFunction: calculateNonInteractiveEndUserOutputService,
  },
  {
    className: "Interface service to other applications",
    calculateFunction: calculateInterfaceServiceToOtherApplications,
  },
  {
    className: "Interface service from other applications",
    calculateFunction: calculateInterfaceServiceFromOtherApplications,
  },
  {
    className: "Data storage service",
    calculateFunction: calculateDataStorageService,
  },
  {
    className: "Algorithmic or manipulation service",
    calculateFunction: calculateAlgorithmicOrManipulationService,
  },
];

export const mlaInputAndStorageClassNames = [
  "Interactive end-user input service",
  "Data storage service",
];

export const mlaNavigationAndQueryClassName =
  "Interactive end-user navigation and query service";

export const mlaNavigationAndQueryComponentTypes = [
  "browsing lists",
  "data inquiries",
  "generation indicators",
  "log-in log-out functions",
];
