import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {fetchAllProjects, fetchProject, updateProject} from "../api/project.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import { Project, ProjectWithUpdate, TGenericComponentNoId } from "../lib/types.ts";
import { createNewProjectVersion } from "../api/project.ts";
import FunctionalClassComponent from "./FunctionalClassComponent.tsx";
import { FunctionalPointSummary } from "./FunctionalPointSummary.tsx";
import useTranslations from "../hooks/useTranslations.ts";
import CreateCurrentDate from "../api/date.ts";
import LoadingSpinner from "./LoadingSpinner.tsx";
import useProjects from "../hooks/useProjects.tsx";
import ConfirmModal from "./ConfirmModal.tsx";

//TODO: add state and component which gives user feedback when project is saved, functionalcomponent is added or deleted etc.
//maybe refactor the if -blocks in the crud functions. maybe the crud functions should be in their own context/file
//maybe better placeholder component when project is being loaded
export default function ProjectPage() {
  const { sessionToken } = useAppUser();
  const { selectedProjectId } = useParams();
  const {setProjects} = useProjects();

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string>("");

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const translation = useTranslations().projectPage;
  const navigate = useNavigate();

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
  };

  const saveProject = async () => {
    if (project) {
      try {
        const editedProject = {...project, editedDate: CreateCurrentDate()};
        const savedProject = await updateProject(sessionToken, editedProject);
        setProject(savedProject);
        alert(translation.projectSaved);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const saveProjectVersion = async () => {
    if (project) {
      
      saveProject(); //TODO: Automatic saving instead?
      try {
        const idOfNewProjectVersion = await createNewProjectVersion(sessionToken, project);
        const updatedProjects = await fetchAllProjects(sessionToken);
        setProjects(updatedProjects);
        navigate(`project/${idOfNewProjectVersion}`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex gap-5 justify-center my-15">
      {loadingProject ? (
        <LoadingSpinner/>
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
            <button
              className="bg-fisma-blue hover:bg-fisma-gray text-white py-4 cursor-pointer w-100 mb-2 fixed top-20"
              onClick={saveProject}
            >
              {translation.saveProject}
            </button>
            <button
              className="bg-fisma-blue hover:bg-fisma-gray text-white py-4 cursor-pointer w-100 mb-2 fixed top-35"
              onClick={() => setConfirmModalOpen(true)}
            >
              {translation.saveProjectAsVersion}{project.version}
            </button>
            <button
              onClick={createFunctionalComponent}
              className="bg-fisma-blue hover:bg-fisma-gray text-white py-4 cursor-pointer w-100 mb-2 fixed top-50"
            >
              {translation.newFunctionalComponent}
            </button>
              {project.functionalComponents.length > 0 && (
                <div className="mt-50">
                  <FunctionalPointSummary project={project} />
                </div>
              )}
          </div>
        </>
      ) : (
        <p>{translation.noProject}</p> //TODO: This does not show!
      )}
      <ConfirmModal
        message={`${translation.saveVersionWarningBeginning} ${project?.version}? ${translation.saveVersionWarningEnd}`}
        open={isConfirmModalOpen}
        setOpen={setConfirmModalOpen}
        onConfirm={() => saveProjectVersion()}
      />
    </div>
  );
}