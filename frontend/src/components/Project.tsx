// import { useState } from "react";
import { projectFromDb } from "../lib/database-moc.ts";
import FunctionalClassComponent from "./FunctionalClassComponent.tsx";

export default function Project() {
  // const [project, setProject] = useState(prjectFromDb);

  const project = projectFromDb;

  return (
    <>
      {project.functionalComponents.map((component) => {
        return(
          <FunctionalClassComponent componentProp={component} key={component.id} />
        );
      })}
    </>
  );
}