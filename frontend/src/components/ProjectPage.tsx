import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { fetchProject, updateProject } from "../api/project.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import {
  Project,
  ProjectWithUpdate,
  TGenericComponentNoId,
} from "../lib/types.ts";
import FunctionalClassComponent from "./FunctionalClassComponent.tsx";
import { FunctionalPointSummary } from "./FunctionalPointSummary.tsx";
import useTranslations from "../hooks/useTranslations.ts";

//TODO: add state and component which gives user feedback when project is saved, functionalcomponent is added or deleted etc.
//maybe refactor the if -blocks in the crud functions. maybe the crud functions should be in their own context/file
//maybe better placeholder component when project is being loaded
export default function ProjectPage() {
  const { sessionToken } = useAppUser();
  const { selectedProjectId } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string>("");

  const translation = useTranslations().projectPage;

  //sort functional components by id (order of creation from oldest to newest)
  const sortedComponents = project?.functionalComponents.sort((a, b) => a.id - b.id);

  useEffect(() => {
    const getProject = async () => {
      setLoadingProject(true);
      try {
        const projectFromDb = await fetchProject(sessionToken, Number(selectedProjectId));
        setProject(projectFromDb);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error occurred when getting project from backend.");
      } finally {
        setLoadingProject(false);
      }
    };

    getProject();
  }, [selectedProjectId, sessionToken]);

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
      };

      const projectWithNewComponent: ProjectWithUpdate = { ...project, functionalComponents: [...project.functionalComponents, newFunctionalComponent,] };

      try {
        const updatedProject: Project = await updateProject(sessionToken, projectWithNewComponent);
        setProject(updatedProject);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteFunctionalComponent = async (componentId: number) => {
    if (window.confirm("Oletko varma, että haluat poistaa funktionaalisen komponentin?")) {
      if (project) {
        const filteredComponents = project?.functionalComponents.filter((component) => component.id !== componentId);
        const filteredProject: Project = { ...project, functionalComponents: filteredComponents };
        try {
          const updatedProject = await updateProject(sessionToken, filteredProject);
          setProject(updatedProject);
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const saveProject = async () => {
    if (project) {
      try {
        // Update edited date to current date when saving project
        const now = new Date();
        const currentDate = new Intl.DateTimeFormat("sv-SV", {
          timeZone: "Europe/Helsinki",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now);
        const editedProject = { ...project, editedDate: currentDate.replace(" ", "T") };
        const savedProject = await updateProject(sessionToken, editedProject);
        setProject(savedProject);
        alert("Project saved!");
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="gap-5 flex justify-center my-20">
      {loadingProject ? (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
          <svg className="animate-spin h-12 w-12" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="blue"
              strokeWidth="4"
              strokeDasharray="31.4"
              strokeLinecap="round"
            ></circle>
          </svg>
        </div>
      ) : error ? (
        <p>{error}</p>
      ) : project ? (
        <>
          <div>
            {sortedComponents?.map((component) => {
              return (
                <FunctionalClassComponent
                  project={project}
                  setProject={setProject}
                  component={component}
                  deleteFunctionalComponent={deleteFunctionalComponent}
                  key={component.id}
                />
              );
            })}
          </div>
          <div className="my-5 flex flex-col">
            {/* Create functionality for this button */}
            <button
              className="bg-fisma-blue hover:bg-fisma-gray text-white px-4 py-4 cursor-pointer mb-2 sticky top-20"
              onClick={saveProject}
            >
              {translation.saveProject}
            </button>
            <button
              onClick={createFunctionalComponent}
              className="bg-fisma-blue hover:bg-fisma-gray text-white px-4 py-4 cursor-pointer my-2 sticky top-40"
            >
              {translation.newFunctionalComponent}
            </button>
            {/* Render summary only if project has functional components */}
            {project.functionalComponents.length > 0 && (
              <FunctionalPointSummary project={project} />
            )}
          </div>
        </>
      ) : (
        <p>{translation.noProject}</p>
      )}
    </div>
  );
}
