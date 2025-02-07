import {
  calculateDataStorageService,
  calculateInteractiveEndUserInputService,
  calculateNonInteractiveEndUserOutputService,
  calculateInterfaceServiceToOtherApplications,
  calculateInterfaceServiceFromOtherApplications,
  calculateInteractiveEndUserNavigationAndQueryService,
  calculateAlgorithmicOrManipulationService
} from "./calculations.ts";

export const classNameOptions = [
  "Interactive end-user navigation and query service",
  "Interactive end-user input service",
  "Non-interactive end-user output service",
  "Interface service to other applications",
  "Interface service from other applications",
  "Data storage service",
  "Algorithmic or manipulation service"
];

export const componentTypeOptions = [
  {
    className: "Interactive end-user navigation and query service",
    componentTypeOptions: [
      "function designators",
      "log-in, log-out functions",
      "function lists",
      "selection lists",
      "data inquiries",
      "generation indicators",
      "browsing lists",
    ],
  },
  {
    className: "Interactive end-user input service",
    componentTypeOptions: [
      "1-functional",
      "2-functional",
      "3-functional"],
  },
  {
    className: "Non-interactive end-user output service",
    componentTypeOptions: [
      "forms",
      "reports",
      "emails for text messages",
      "monitor screens"
    ]
  },
  {
    className: "Interface service to other applications",
    componentTypeOptions: [
      "messages to other applications",
      "batch records to other applications",
      "signals to devices or other applications"
    ]
  },
  {
    className: "Interface service from other applications",
    componentTypeOptions: [
      "messages from other applications",
      "batch records from other applications",
      "signals from devices or other applications"
    ]
  },
  {
    className: "Data storage service",
    componentTypeOptions: [
      "entities or classes",
      "other record types"
    ],
  },
  {
    className: "Algorithmic or manipulation service",
    componentTypeOptions: [
      "security routines",
      "calculation routines",
      "simulation routines",
      "formatting routines",
      "database cleaning routines",
      "other manipulation routines"
    ]
  }
];

export const calculateFunctions = [
  {
    className: "Interactive end-user navigation and query service",
    calculateFunction: calculateInteractiveEndUserNavigationAndQueryService
  },
  {
    className: "Interactive end-user input service",
    calculateFunction: calculateInteractiveEndUserInputService,
  },
  {
    className: "Non-interactive end-user output service",
    calculateFunction: calculateNonInteractiveEndUserOutputService
  },
  {
    className: "Interface service to other applications",
    calculateFunction: calculateInterfaceServiceToOtherApplications
  },
  {
    className: "Interface service from other applications",
    calculateFunction: calculateInterfaceServiceFromOtherApplications
  },
  {
    className: "Data storage service",
    calculateFunction: calculateDataStorageService,
  },
  {
    className: "Algorithmic or manipulation service",
    calculateFunction: calculateAlgorithmicOrManipulationService
  }
];