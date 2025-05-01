import { ReactNode } from "react"

export type ContextProviderProps = {
  children: ReactNode
}

export type projectAppUser = {
  appUserId: number
}

//TODO: the following 2 types are up for change but backend expects this type of data when changing functional components of a project
export type TGenericComponentNoId = {
  className: string | null,
  componentType: string | null,
  dataElements: number | null;
  readingReferences: number | null;
  writingReferences: number | null;
  functionalMultiplier: number | null;
  operations: number | null;
  degreeOfCompletion: number | null;
  comment: string | null;
  previousFCId: number | null;
}

export type ProjectWithUpdate = {
  id: number,
  projectName: string,
  version: number,
  createdDate: string,
  versionDate: string,
  editedDate: string,
  totalPoints: number,
  functionalComponents: (TGenericComponent | TGenericComponentNoId)[],
  appUsers: projectAppUser[]
}

export type Project = {
  id: number,
  projectName: string,
  version: number,
  createdDate: string,
  versionDate: string,
  editedDate: string,
  totalPoints: number,
  functionalComponents: TGenericComponent[],
  appUsers: projectAppUser[]
}

export type TGenericComponent = {
  id: number,
  className: string | null,
  componentType: string | null,
  dataElements: number | null;
  readingReferences: number | null;
  writingReferences: number | null;
  functionalMultiplier: number | null;
  operations: number | null;
  degreeOfCompletion: number | null;
  comment: string | null;
  previousFCId: number | null;
  projectId: number;
}

export type TInteractiveEndUserNavigationAndQueryService = {
  id: number;
  className: "Interactive end-user navigation and query service";
  componentType:
  | null
  | "function designators"
  | "log-in log-out functions"
  | "function lists"
  | "selection lists"
  | "data inquiries"
  | "generation indicators"
  | "browsing lists";
  dataElements: number;
  readingReferences: number;
  writingReferences: null;
  functionalMultiplier: null;
  operations: null;
  degreeOfCompletion: number | null;
  comment: string | null;
  previousFCId: number | null;
  projectId: number;
};

export type TInteractiveEndUserInputService = {
  id: number;
  className: "Interactive end-user input service";
  componentType: null | "1-functional" | "2-functional" | "3-functional";
  dataElements: number;
  readingReferences: number;
  writingReferences: number;
  functionalMultiplier: null;
  operations: null;
  degreeOfCompletion: number | null;
  comment: string | null;
  previousFCId: number | null;
  projectId: number;
}

export type TDataStorageService = {
  id: number;
  className: "Data storage service";
  componentType: null | "entities or classes" | "other record types";
  dataElements: number;
  readingReferences: null;
  writingReferences: null;
  functionalMultiplier: null;
  operations: null;
  degreeOfCompletion: number | null;
  comment: string | null;
  previousFCId: number | null;
  projectId: number;
};

export type TNonInteractiveEndUserOutputService = {
  id: number;
  className: "Non-interactive end-user output service";
  componentType: null | "forms" | "reports" | "emails or text messages" | "monitor screens";
  dataElements: number;
  readingReferences: number;
  writingReferences: null;
  functionalMultiplier: null;
  operations: null;
  degreeOfCompletion: number | null;
  comment: string | null;
  previousFCId: number | null;
  projectId: number;
};

export type TInterfaceServiceToOtherApplications = {
  id: number;
  className: "Interface service to other applications";
  componentType: null | "messages to other applications" | "batch records to other applications" | "signals to devices or other applications";
  dataElements: number;
  readingReferences: number;
  writingReferences: null;
  functionalMultiplier: null;
  operations: null;
  degreeOfCompletion: number | null;
  comment: string | null;
  previousFCId: number | null;
  projectId: number;
};

export type TInterfaceServiceFromOtherApplications = {
  id: number;
  className: "Interface service from other applications";
  componentType: null | "messages from other applications" | "batch records from other applications" | "signals from devices or other applications";
  dataElements: number;
  readingReferences: number;
  writingReferences: number;
  functionalMultiplier: null;
  operations: null;
  degreeOfCompletion: number | null;
  comment: string | null;
  previousFCId: number | null;
  projectId: number;
};

export type TAlgorithmicOrManipulationService = {
  id: number;
  className: "Algorithmic or manipulation service";
  componentType:
  | null
  | "security routines"
  | "calculation routines"
  | "simulation routines"
  | "formatting routines"
  | "database cleaning routines"
  | "other manipulation routines";
  dataElements: number;
  readingReferences: null;
  writingReferences: null;
  functionalMultiplier: null;
  operations: number;
  degreeOfCompletion: number | null;
  comment: string | null;
  previousFCId: number | null;
  projectId: number;
};

export type ClassName = "Interactive end-user navigation and query service" |
  "Interactive end-user input service" |
  "Non-interactive end-user output service" |
  "Interface service to other applications" |
  "Interface service from other applications" |
  "Data storage service" |
  "Algorithmic or manipulation service"

export type ComponentType = "function designators" |
  "log-in log-out functions" |
  "function lists" |
  "selection lists" |
  "data inquiries" |
  "generation indicators" |
  "browsing lists" |
  "1-functional" |
  "2-functional" |
  "3-functional" |
  "forms" |
  "reports" |
  "emails for text messages" |
  "monitor screens" |
  "messages to other applications" |
  "batch records to other applications" |
  "signals to devices or other applications" |
  "messages from other applications" |
  "batch records from other applications" |
  "signals from devices or other applications" |
  "entities or classes" |
  "other record types" |
  "security routines" |
  "calculation routines" |
  "simulation routines" |
  "formatting routines" |
  "database cleaning routines" |
  "other manipulation routines"

export type CalculationParameter = "dataElements" |
  "writingReferences" |
  "readingReferences" |
  "operations"
