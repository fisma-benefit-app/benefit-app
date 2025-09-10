import { ReactNode } from "react"

export type ContextProviderProps = {
  children: ReactNode
}

export type projectAppUser = {
  appUserId: number
}

//TODO: the following 2 types are up for change but backend expects this type of data when changing functional components of a project
export type TGenericComponentNoId = {
  className: ClassName,
  componentType: ComponentType | null,
  dataElements: number | null;
  readingReferences: number | null;
  writingReferences: number | null;
  functionalMultiplier: number | null;
  operations: number | null;
  degreeOfCompletion: number | null;
  comment: string | null;
  previousFCId: number | null; // WTF is this???
  orderPosition: number;
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
  className: ClassName,
  componentType: ComponentType | null,
  dataElements: number | null;
  readingReferences: number | null;
  writingReferences: number | null;
  functionalMultiplier: number | null;
  operations: number | null;
  degreeOfCompletion: number | null;
  comment: string | null;
  previousFCId: number | null;
  orderPosition: number;
}

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
