import { Project } from "./types";

export const projectFromDb = {
  id: 99,
  projectName: "project-x",
  version: 1,
  createdDate: "2025-01-28T17:23:19",
  totalPoints: 100.12,
  appUsers: [],
  functionalComponents: [
    {
      id: 99,
      className: "Interactive end-user input service",
      componentType: "1-functional",
      dataElements: 2,
      readingReferences: 4,
      writingReferences: 3,
      functionalMultiplier: 1,
      operations: null,
      degreeOfCompletion: 0.13,
      comment: "Poikkeuksellinen komponentti!",
      projectId: 44,
    },
    {
      id: 100,
      className: "Data storage service",
      componentType: "entities or classes",
      dataElements: 4,
      readingReferences: null,
      writingReferences: null,
      functionalMultiplier: null,
      operations: null,
      degreeOfCompletion: 0.27,
      comment: "Tämä täytyy tarkistaa myöhemmin uudelleen.",
      projectId: 44,
    },
  ],
}satisfies Project;