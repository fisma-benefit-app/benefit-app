// import { useState } from "react";
import { projectFromDb } from "../lib/database-moc.ts";
import FunctionalClassComponent from "./FunctionalClassComponent.tsx";
import { FunctionalPointSummary } from "./FunctionalPointSummary.tsx";

export default function Project() {
  // const [project, setProject] = useState(prjectFromDb);

  const project = projectFromDb;

  return (
    <div className="flex justify-center items-center h-screen gap-5">
      <div className="flex-1">
        {project.functionalComponents.map((component) => {
          return (
            <FunctionalClassComponent componentProp={component} key={component.id} />
          );
        })}
      </div>
      <div className="flex-auto">
        <FunctionalPointSummary functionalComponents={project.functionalComponents} />
      </div>
    </div>
  );
}