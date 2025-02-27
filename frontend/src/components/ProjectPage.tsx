import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { fetchProject, updateProject } from "../api/project.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import { Project, ProjectWithUpdate, TGenericComponentNoId, TGenericComponent } from "../lib/types.ts";
import FunctionalClassComponent from "./FunctionalClassComponent.tsx";
import { FunctionalPointSummary } from "./FunctionalPointSummary.tsx";

//TODO: add state and component which gives user feedback when project is saved, functionalcomponent is added or deleted etc.
//maybe refactor the if -blocks in the crud functions. maybe the crud functions should be in their own file
//maybe better placeholder component when project is being loaded
//expand saving so that the whole project update is saved instead of an update in a single component.
export default function ProjectPage() {

  const { sessionToken } = useAppUser();
  const { selectedProjectId } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const getProject = async () => {
      setLoadingProject(true);
      try {
        const projectFromDb = await fetchProject(sessionToken, selectedProjectId);
        setProject(projectFromDb)
      } catch (err) {
        setError((err instanceof Error ? err.message : "Unexpected error occurred when getting project from backend."));
      } finally {
        setLoadingProject(false);
      }
    }

    getProject();
  }, [])

  const createFunctionalComponent = async () => {
    if (project) {
      const newFunctionalComponent: TGenericComponentNoId = {
        className: "Interactive end-user navigation and query service",
        componentType: null,
        dataElements: 0,
        readingReferences: 0,
        writingReferences: null,
        functionalMultiplier: null,
        operations: null,
        degreeOfCompletion: null,
        comment: null,
      }

      const projectWithNewComponent: ProjectWithUpdate = { ...project, functionalComponents: [...project.functionalComponents, newFunctionalComponent] };

      try {
        const updatedProject: Project = await updateProject(sessionToken, projectWithNewComponent);
        setProject(updatedProject)
      } catch (err) {
        console.error(err);
      }
    }
  }

  const deleteFunctionalComponent = async (componentId: number) => {
    if (project) {
      const filteredComponents = project?.functionalComponents.filter(component => component.id !== componentId);
      const filteredProject: Project = { ...project, functionalComponents: filteredComponents };
      try {
        const updatedProject = await updateProject(sessionToken, filteredProject);
        setProject(updatedProject);
      } catch (err) {
        console.error(err);
      }
    }
  }

  const saveFunctionalComponent = async (updatedComponent: TGenericComponent) => {
    if (project) {
      const componentsWithUpdatedComponent = project.functionalComponents.map(component => component.id === updatedComponent.id ? updatedComponent : component);
      const projectWithUpdatedcomponent: Project = { ...project, functionalComponents: componentsWithUpdatedComponent };
      try {
        const savedProject = await updateProject(sessionToken, projectWithUpdatedcomponent)
        setProject(savedProject);
        alert("Component saved!");
      } catch (err) {
        console.error(err);
      }
    }
  }

  return (
    <div className="flex gap-5">
      {loadingProject ? (
        <p>Ladataan projektia...</p>
      ) : error ? (
        <p>{error}</p>
      ) : project ? (
        <>
          <div>
            {project.functionalComponents.map((component) => {
              return (
                <FunctionalClassComponent componentProp={component} saveFunctionalComponent={saveFunctionalComponent} deleteFunctionalComponent={deleteFunctionalComponent} key={component.id} />
              );
            })}
          </div>
          <div className="my-5 flex flex-col">
            {/* Create functionality for this button */}
            <button
              className="bg-sky-600 hover:bg-zinc-600 text-white px-4 py-4 cursor-pointer my-2 sticky top-20"
            >
              Tallenna projekti
            </button>
            <button
              onClick={createFunctionalComponent}
              className="bg-sky-600 hover:bg-zinc-600 text-white px-4 py-4 cursor-pointer my-2 sticky top-20"
            >
              Uusi funktionaalinen komponentti
            </button>
            {/* Render summary only if project has functional components */}
            {project.functionalComponents.length > 0 && <FunctionalPointSummary project={project} />}
          </div>
        </>
      ) : (
        <p>Ei näytettäviä projektitietoja!</p>
      )}
    </div>
  );
}