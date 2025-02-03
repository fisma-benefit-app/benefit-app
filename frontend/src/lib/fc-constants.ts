import {
  calculateDataStorageService,
  calculateInteractiveEndUserInputService,
  calculateInteractiveEndUserNavigationAndQueryService
} from "./calculations.ts";

export const classNameOptions = [
  "Interactive end-user navigation and query service",
  "Interactive end-user input service",
  "Data storage service",
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
    componentTypeOptions: ["1-functional", "2-functional", "3-functional"],
  },
  {
    className: "Data storage service",
    componentTypeOptions: ["entities or classes", "other record types"],
  },
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
    className: "Data storage service",
    calculateFunction: calculateDataStorageService,
  },
];