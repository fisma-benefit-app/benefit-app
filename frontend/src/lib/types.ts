export type TGenericComponent = {
  id: number,
  className: string | null,
  componentType: string | null,
  dataElements: number | null;
  readingReferences: number | null;
  writingReferences: number | null;
  functionalMultiplier: number | null;
  operations: number | null;
  projectId: number;
}

export type TInteractiveEndUserNavigatioinAndQueryService = {
  id: number;
  className: "Interactive end-user navigation and query service";
  componentType:
    | null
    | "function designators"
    | "log-in, log-out functions"
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
  projectId: number;
};

export type TInteractiveEndUserInputService = {
  id: number;
  className: "Interactive end-user input service";
  componentType: null | "1-functional" | "2-functional" | "3-functional";
  dataElements: number;
  readingReferences: number;
  writingReferences: number;
  functionalMultiplier: number;
  operations: null;
  projectId: number;
}

export type TDataStrorageService = {
  id: number;
  className: "Data storage service";
  componentType: null | "entities or classes" | "other record types";
  dataElements: number;
  readingReferences: null;
  writingReferences: null;
  functionalMultiplier: null;
  operations: null;
  projectId: number;
};