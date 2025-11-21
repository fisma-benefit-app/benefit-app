import {
  calculateDataStorageService,
  calculateInteractiveEndUserInputService,
  calculateNonInteractiveEndUserOutputService,
  calculateInterfaceServiceToOtherApplications,
  calculateInterfaceServiceFromOtherApplications,
  calculateInteractiveEndUserNavigationAndQueryService,
  calculateAlgorithmicOrManipulationService,
} from "./calculations.ts";
import {
  ClassName,
  ComponentType,
  MLAsubComponent,
  TGenericComponent,
} from "./types.ts";

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

/*
 * Factory function to create MLAsubComponents with only the necessary overrides
 * null values are later read from the parent component
 */
const createMLASubComponent = (
  overrides: Partial<MLAsubComponent> & {
    className:
      | "Interface service to other applications"
      | "Interface service from other applications";
    componentType:
      | "messages to other applications"
      | "messages from other applications";
    subComponentType: "B-UI" | "UI-B" | "B-D" | "D-B";
    readingReferences: number | null;
    writingReferences: number | null;
  },
): MLAsubComponent => ({
  id: 0,
  title: null,
  description: null,
  dataElements: null,
  functionalMultiplier: null,
  operations: null,
  degreeOfCompletion: null,
  previousFCId: null,
  orderPosition: 0,
  isMLA: false,
  parentFCId: null,
  isReadonly: true as const,
  subComponents: undefined as never,
  ...overrides,
});

// Interactive Service Components (interactive end-user navigation and query service and Interactive end-user input service)
export const interactiveServiceSendingUIB = createMLASubComponent({
  className: "Interface service to other applications",
  componentType: "messages to other applications",
  subComponentType: "UI-B",
  readingReferences: 1,
  writingReferences: null,
});

export const interactiveServiceReceivingUIB = createMLASubComponent({
  className: "Interface service from other applications",
  componentType: "messages from other applications",
  subComponentType: "UI-B",
  readingReferences: 1,
  writingReferences: 1,
});

export const interactiveServiceSendingBUI = createMLASubComponent({
  className: "Interface service to other applications",
  componentType: "messages to other applications",
  subComponentType: "B-UI",
  readingReferences: null, // this value is calculated from parent component's references
  writingReferences: null,
});

export const interactiveServiceReceivingBUI = createMLASubComponent({
  className: "Interface service from other applications",
  componentType: "messages from other applications",
  subComponentType: "B-UI",
  readingReferences: 1,
  writingReferences: null, // this value is calculated from parent component's references
});

// Data Storage Service Components
export const dataStorageServiceSendingBD = createMLASubComponent({
  className: "Interface service to other applications",
  componentType: "messages to other applications",
  subComponentType: "B-D",
  readingReferences: 2,
  writingReferences: null,
});

export const dataStorageServiceReceivingBD = createMLASubComponent({
  className: "Interface service from other applications",
  componentType: "messages from other applications",
  subComponentType: "B-D",
  readingReferences: 1,
  writingReferences: 1,
});

export const dataStorageServiceSendingDB = createMLASubComponent({
  className: "Interface service to other applications",
  componentType: "messages to other applications",
  subComponentType: "D-B",
  readingReferences: 1,
  writingReferences: null,
});

export const dataStorageServiceReceivingDB = createMLASubComponent({
  className: "Interface service from other applications",
  componentType: "messages from other applications",
  subComponentType: "D-B",
  readingReferences: null,
  writingReferences: 1,
});

/**
 * This map lists functional component's parameters (ie. reading or writing references) that are not used in calculations
 * Parameters not used in calculations are reset to null
 * Parameters that are not reset cause errors in subcomponent references calculations for certain component classes
 */
export const componentParameterResetMap: Record<
  ClassName,
  (keyof TGenericComponent)[]
> = {
  "Interactive end-user navigation and query service": [
    "writingReferences",
    "operations",
    "functionalMultiplier",
  ],
  "Interactive end-user input service": ["operations"],
  "Non-interactive end-user output service": [
    "writingReferences",
    "operations",
    "functionalMultiplier",
  ],
  "Interface service to other applications": [
    "writingReferences",
    "operations",
    "functionalMultiplier",
  ],
  "Interface service from other applications": [
    "operations",
    "functionalMultiplier",
  ],
  "Data storage service": [
    "readingReferences",
    "writingReferences",
    "operations",
    "functionalMultiplier",
  ],
  "Algorithmic or manipulation service": [
    "readingReferences",
    "writingReferences",
    "functionalMultiplier",
  ],
};
