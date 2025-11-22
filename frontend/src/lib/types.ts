import { ReactNode } from "react";

// Props types
export type ContextProviderProps = {
  children: ReactNode;
};

// DTOs
export type ProjectRequest = {
  projectName: string;
  version: number;
  functionalComponents: FunctionalComponentRequest[];
  projectAppUserIds: number[];
};

export type ProjectResponse = {
  id: number;
  projectName: string;
  version: number;
  createdAt: string;
  versionCreatedAt: string;
  updatedAt: string;
  functionalComponents: FunctionalComponentResponse[];
  projectAppUsers: ProjectAppUserResponse[];
};

export type FunctionalComponentRequest = {
  id?: number; // Optional for creation, required for updates
  title: string | null;
  description: string | null;
  className: ClassName;
  componentType: ComponentType | null;
  dataElements: number | null;
  readingReferences: number | null;
  writingReferences: number | null;
  functionalMultiplier: number | null;
  operations: number | null;
  degreeOfCompletion: number | null;
  previousFCId: number | null;
  orderPosition: number;
  isMLA: boolean;
  parentFCId: number | null;
  subComponentType: string | null;
  isReadonly: boolean;
  subComponents: FunctionalComponentRequest[];
};
export type FunctionalComponentResponse = FunctionalComponentRequest & {
  id: number;
};

export type ProjectAppUserResponse = {
  id: number;
  appUser: AppUserSummary;
};

export type AppUserSummary = {
  id: number;
  username: string;
};

// Remove if needed
export type ProjectAppUser = {
  id: number;
  appUserId?: number; // wtf is this?
};

export type TGenericComponentNoId = {
  title: string | null;
  description: string | null;
  className: ClassName | null;
  componentType: ComponentType | null;
  dataElements: number | null;
  readingReferences: number | null;
  writingReferences: number | null;
  functionalMultiplier: number | null;
  operations: number | null;
  degreeOfCompletion: number | null;
  previousFCId: number | null;
  orderPosition: number;
  isMLA: boolean;
  parentFCId: number | null;
};

export type ProjectWithUpdate = {
  id: number;
  projectName: string;
  version: number;
  createdAt: string;
  versionCreatedAt: string;
  updatedAt: string;
  functionalComponents: (TGenericComponent | TGenericComponentNoId)[];
  appUsers: ProjectAppUser[];
};

export type Project = {
  id: number;
  projectName: string;
  version: number;
  createdAt: string;
  versionCreatedAt: string;
  updatedAt: string;
  functionalComponents: TGenericComponent[];
  projectAppUsers: ProjectAppUser[];
};

export type MLAsubComponent = TGenericComponent & {
  subComponentType: "B-UI" | "UI-B" | "B-D" | "D-B";
  isReadonly: true;
  subComponents: never;
};

export type TGenericComponent = {
  id: number;
  title: string | null;
  description: string | null;
  className: ClassName;
  componentType: ComponentType | null;
  dataElements: number | null;
  readingReferences: number | null;
  writingReferences: number | null;
  functionalMultiplier: number | null;
  operations: number | null;
  degreeOfCompletion: number | null;
  previousFCId: number | null;
  orderPosition: number;
  isMLA: boolean;
  parentFCId: number | null;
  subComponents?: MLAsubComponent[];
};

// Enums and constants
export type ClassName =
  | "Interactive end-user navigation and query service"
  | "Interactive end-user input service"
  | "Non-interactive end-user output service"
  | "Interface service to other applications"
  | "Interface service from other applications"
  | "Data storage service"
  | "Algorithmic or manipulation service";

export type ComponentType =
  | "function designators"
  | "log-in log-out functions"
  | "function lists"
  | "selection lists"
  | "data inquiries"
  | "generation indicators"
  | "browsing lists"
  | "1-functional"
  | "2-functional"
  | "3-functional"
  | "forms"
  | "reports"
  | "emails for text messages"
  | "monitor screens"
  | "messages to other applications"
  | "batch records to other applications"
  | "signals to devices or other applications"
  | "messages from other applications"
  | "batch records from other applications"
  | "signals from devices or other applications"
  | "entities or classes"
  | "other record types"
  | "security routines"
  | "calculation routines"
  | "simulation routines"
  | "formatting routines"
  | "database cleaning routines"
  | "other manipulation routines";

export type CalculationParameter =
  | "dataElements"
  | "writingReferences"
  | "readingReferences"
  | "operations";
