import { ChangeEvent, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  fetchAllProjects,
  fetchProject,
  updateProject,
  createFunctionalComponent,
  deleteFunctionalComponent,
} from "../api/project.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import {
  Project,
  ProjectResponse,
  TGenericComponentNoId,
  TGenericComponent,
} from "../lib/types.ts";
import { createNewProjectVersion } from "../api/project.ts";
import FunctionalClassComponent from "./FunctionalClassComponent.tsx";
import { FunctionalPointSummary } from "./FunctionalPointSummary.tsx";
import useTranslations from "../hooks/useTranslations.ts";
import CreateCurrentDate from "../api/date.ts";
import LoadingSpinner from "./LoadingSpinner.tsx";
import useProjects from "../hooks/useProjects.tsx";
import ConfirmModal from "./ConfirmModal.tsx";
import useCommitSha from "../hooks/useCommitSha";

// dnd-kit imports
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAlert } from "../context/AlertProvider.tsx";
import {
  createSubComponents,
  updateSubComponents,
} from "../lib/fc-service-functions.ts";

function SortableFunctionalComponent({
  component,
  project,
  setProject,
  setProjectResponse,
  deleteFunctionalComponent,
  isLatest,
  collapsed,
  onCollapseChange,
  debouncedSaveProject,
  onMLAToggle,
}: {
  component: TGenericComponent;
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project | null>>;
  setProjectResponse: React.Dispatch<
    React.SetStateAction<ProjectResponse | null>
  >;
  deleteFunctionalComponent: (id: number) => Promise<void>;
  isLatest: boolean;
  collapsed: boolean;
  onCollapseChange: (componentId: number, collapsed: boolean) => void;
  debouncedSaveProject: () => void;
  onMLAToggle: (componentId: number, newMLAValue: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: component.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <FunctionalClassComponent
        project={project}
        setProject={setProject}
        setProjectResponse={setProjectResponse}
        component={component}
        deleteFunctionalComponent={deleteFunctionalComponent}
        isLatest={isLatest}
        collapsed={collapsed}
        onCollapseChange={onCollapseChange}
        debouncedSaveProject={debouncedSaveProject}
        dragHandleProps={{ ...attributes, ...listeners }}
        onMLAToggle={onMLAToggle}
      />
    </div>
  );
}

// Debounce hook for auto-saving projects
function useDebounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function debouncedFunction(...args: Parameters<T>) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => func(...args), delay);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return debouncedFunction;
}

function sortFunctionalComponents(components: TGenericComponent[]) {
  return components.slice().sort((a, b) => a.orderPosition - b.orderPosition);
}

export default function ProjectPage() {
  const { sessionToken, logout } = useAppUser();
  const { selectedProjectId } = useParams();
  const { setProjects, sortedProjects, checkIfLatestVersion } = useProjects();
  const navigate = useNavigate();
  const [collapseAll, setCollapseAll] = useState<boolean>(true);
  const [project, setProject] = useState<Project | null>(null);
  const [projectResponse, setProjectResponse] =
    useState<ProjectResponse | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string>("");

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [lastAddedComponentId, setLastAddedComponentId] = useState<
    number | null
  >(null);

  const translation = useTranslations().projectPage;
  const alertTranslation = useTranslations().alert;

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const commitSha = useCommitSha("");

  //get all versions of the same project
  const allProjectVersions: Project[] = sortedProjects.filter(
    (projectInArray) => project?.projectName === projectInArray.projectName,
  );

  //only allow user to edit project if it is the latest one
  const isLatest = checkIfLatestVersion(project, allProjectVersions);

  // MLA sub-component handler
  const handleMLAToggle = (componentId: number, newMLAValue: boolean) => {
    if (!project) return;

    const updatedComponents = project.functionalComponents.map((comp) => {
      if (comp.id === componentId) {
        if (newMLAValue && !comp.subComponents) {
          return {
            ...comp,
            isMLA: true,
            subComponents: createSubComponents(comp),
          };
        } else if (!newMLAValue) {
          return {
            ...comp,
            isMLA: false,
            subComponents: undefined,
          };
        }
        return { ...comp, isMLA: newMLAValue };
      }
      return comp;
    });

    const updatedProject = {
      ...project,
      functionalComponents: updatedComponents,
    };

    setProject(updatedProject);

    if (isLatest) {
      debouncedSaveProject();
    }
  };

  // sort functional components by order (ascending)
  const sortedComponents = project
    ? sortFunctionalComponents(project.functionalComponents)
    : [];

  // Alert functionality
  const { showNotification, updateNotification } = useAlert();

  // Flag for tracking manual saves
  const isManuallySaved = useRef(false);

  // Ref to always have the latest project state
  const projectRef = useRef<Project | null>(null);

  // Update the ref whenever project changes
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // Debounced auto-save function
  const debouncedSaveProject = useDebounce(async () => {
    const currentProject = projectRef.current;
    if (!currentProject || isManuallySaved.current) {
      return;
    }

    showNotification(
      alertTranslation.save,
      alertTranslation.saving,
      "loading",
      "auto-save",
    );

    try {
      // normalize before saving
      const normalized = currentProject.functionalComponents
        .slice()
        .map((comp) => {
          // Update sub-components if MLA is enabled
          if (comp.isMLA && comp.subComponents) {
            return {
              ...comp,
              subComponents: updateSubComponents(comp, comp.subComponents),
            };
          }
          return comp;
        })
        .sort((a, b) => a.orderPosition - b.orderPosition)
        .map((c, idx) => ({ ...c, orderPosition: idx }));
      const editedProject = {
        ...currentProject,
        functionalComponents: normalized,
        updatedAt: CreateCurrentDate(),
      };

      await updateProject(sessionToken, editedProject);

      updateNotification(
        "auto-save",
        alertTranslation.success,
        alertTranslation.saveSuccessful,
        "success",
      );
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        await logout();
      }

      updateNotification(
        "auto-save",
        alertTranslation.error,
        alertTranslation.saveFailed,
        "error",
      );
    }
  }, 5000); // Auto-save every 5 seconds

  // Collapse state management for preventing components collapsing during auto-save
  const [componentCollapseStates, setComponentCollapseStates] = useState<
    Map<number, boolean>
  >(new Map());

  const updateComponentCollapseState = (
    componentId: number,
    collapsed: boolean,
  ) => {
    setComponentCollapseStates((prev) => {
      const newMap = new Map(prev);
      newMap.set(componentId, collapsed);
      return newMap;
    });
  };

  const getComponentCollapseState = (componentId: number): boolean => {
    if (componentCollapseStates.has(componentId)) {
      return componentCollapseStates.get(componentId)!;
    }
    return collapseAll ? componentId !== lastAddedComponentId : false;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const componentId = Number(event.active.id);
    if (!Number.isFinite(componentId)) return;
    updateComponentCollapseState(componentId, true);
  };

  useEffect(() => {
    const getProject = async () => {
      setLoadingProject(true);
      try {
        const projectFromDb = await fetchProject(
          sessionToken,
          Number(selectedProjectId),
        );

        // normalize & sort after fetching
        interface NormalizedComponent extends TGenericComponent {
          orderPosition: number;
        }

        const normalized: NormalizedComponent[] =
          projectFromDb.functionalComponents
            .slice()
            .sort(
              (a: TGenericComponent, b: TGenericComponent) =>
                a.orderPosition - b.orderPosition,
            )
            .map(
              (c: TGenericComponent, idx: number): NormalizedComponent => ({
                ...c,
                orderPosition: idx,
              }),
            );

        setProject({ ...projectFromDb, functionalComponents: normalized });
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized!") {
          await logout();
        }
        console.error("Error fetching project");
        setError(
          err instanceof Error
            ? err.message
            : "Unexpected error occurred when getting project from backend.",
        );
      } finally {
        setLoadingProject(false);
      }
    };
    getProject();
  }, [selectedProjectId, sessionToken, logout]);

  const handleCreateFunctionalComponent = async () => {
    await saveProject(false);

    isManuallySaved.current = true;
    setLoadingProject(true);

    if (project) {
      const newFunctionalComponent: TGenericComponentNoId = {
        className: null,
        componentType: null,
        dataElements: null,
        readingReferences: null,
        writingReferences: null,
        functionalMultiplier: null,
        operations: null,
        degreeOfCompletion: 1,
        title: null,
        description: null,
        previousFCId: null,
        orderPosition: project.functionalComponents.length,
        isMLA: false,
        parentFCId: null,
      };

      showNotification(
        alertTranslation.creating,
        alertTranslation.creating,
        "loading",
        "create-functional-component",
      );

      try {
        const updatedProject = await createFunctionalComponent(
          sessionToken,
          project.id,
          newFunctionalComponent,
        );

        // Find the new component by comparing IDs
        const prevIds = new Set(project.functionalComponents.map((c) => c.id));
        const newComponent = updatedProject.functionalComponents.find(
          (c) => !prevIds.has(c.id),
        );

        if (newComponent) {
          setLastAddedComponentId(newComponent.id);
        }

        // Normalize and sort before setting state
        const normalized = updatedProject.functionalComponents
          .slice()
          .sort((a, b) => a.orderPosition - b.orderPosition)
          .map((c, idx) => ({ ...c, orderPosition: idx }));

        setProject({ ...updatedProject, functionalComponents: normalized });

        updateNotification(
          "create-functional-component",
          alertTranslation.success,
          alertTranslation.createSuccessful,
          "success",
        );

        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized!") {
          await logout();
        }
        updateNotification(
          "create-functional-component",
          alertTranslation.error,
          alertTranslation.createFailed,
          "error",
        );
      } finally {
        setLoadingProject(false);
        setTimeout(() => {
          isManuallySaved.current = false;
        }, 2000);
      }
    }
  };

  const handleDeleteFunctionalComponent = async (
    componentId: number,
  ): Promise<void> => {
    isManuallySaved.current = true;
    setLoadingProject(true);

    showNotification(
      alertTranslation.deleting,
      alertTranslation.deleting,
      "loading",
      "delete-functional-component",
    );

    if (project) {
      try {
        await deleteFunctionalComponent(sessionToken, componentId, project.id);

        const updatedProject = await fetchProject(sessionToken, project.id);
        setProject(updatedProject);

        updateNotification(
          "delete-functional-component",
          alertTranslation.success,
          alertTranslation.deleteSuccessful,
          "success",
        );
      } catch (err) {
        console.error("Delete component error:", err);

        if (err instanceof Error && err.message.includes("JSON")) {
          try {
            const updatedProject = await fetchProject(sessionToken, project.id);
            setProject(updatedProject);

            updateNotification(
              "delete-functional-component",
              alertTranslation.success,
              alertTranslation.deleteSuccessful,
              "success",
            );
            return;
          } catch (fetchErr) {
            console.error("Refetch failed:", fetchErr);
          }
        }

        if (err instanceof Error && err.message === "Unauthorized!") {
          await logout();
        }

        updateNotification(
          "delete-functional-component",
          alertTranslation.error,
          alertTranslation.deleteFailed,
          "error",
        );
      } finally {
        setLoadingProject(false);
        setTimeout(() => {
          isManuallySaved.current = false;
        }, 2000);
      }
    }
  };

  const saveProject = async (showNotif: boolean = true) => {
    isManuallySaved.current = true;
    if (project) {
      if (showNotif) {
        showNotification(
          alertTranslation.save,
          alertTranslation.saving,
          "loading",
          "manual-save",
        );
      }
      try {
        const normalized = project.functionalComponents
          .slice()
          .sort((a, b) => a.orderPosition - b.orderPosition)
          .map((c, idx) => ({ ...c, orderPosition: idx }));

        const editedProject = {
          ...project,
          functionalComponents: normalized,
          updatedAt: CreateCurrentDate(),
        };

        const savedProject = await updateProject(sessionToken, editedProject);
        setProjectResponse(savedProject);

        if (showNotif) {
          updateNotification(
            "manual-save",
            alertTranslation.success,
            alertTranslation.saveSuccessful,
            "success",
          );
        }
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized!") {
          await logout();
        }
        if (showNotif) {
          updateNotification(
            "manual-save",
            alertTranslation.error,
            alertTranslation.saveFailed,
            "error",
          );
        }
      } finally {
        setTimeout(() => {
          isManuallySaved.current = false;
        }, 5000);
      }
    } else {
      isManuallySaved.current = false;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!project || !over || active.id === over.id) return;

    const sorted = project.functionalComponents
      .slice()
      .sort((a, b) => a.orderPosition - b.orderPosition);

    const oldIndex = sorted.findIndex((c) => c.id === active.id);
    const newIndex = sorted.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const updated = [...sorted];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);

    const reOrdered = updated.map((c, index) => ({
      ...c,
      orderPosition: index,
    }));

    setProject({ ...project, functionalComponents: reOrdered });

    if (isLatest) {
      debouncedSaveProject();
    }
  };

  const saveProjectVersion = async () => {
    if (project) {
      isManuallySaved.current = true;
      try {
        await saveProject();
        const idOfNewProjectVersion = await createNewProjectVersion(
          sessionToken,
          project,
        );
        const updatedProjects = await fetchAllProjects(sessionToken);
        setProjects(updatedProjects);
        navigate(`/project/${idOfNewProjectVersion}`);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized!") {
          await logout();
        }
        console.error("Error creating new project version");
      } finally {
        setTimeout(() => {
          isManuallySaved.current = false;
        }, 5000);
      }
    }
  };

  const handleVersionSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedId: number = Number(e.target.value);
    const selectedProject = sortedProjects.find(
      (p: Project) => p.id === selectedId,
    );

    if (selectedProject) {
      navigate(`/project/${selectedId}`);
    }
  };

  useEffect(() => {
    setLastAddedComponentId(null);
    // Clear individual collapse states when collapseAll is toggled
    // so that all components follow the global collapse state
    setComponentCollapseStates(new Map());
  }, [collapseAll]);

  if (loadingProject) return <LoadingSpinner />;

  return (
    <>
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start px-5 pt-24 xl:pt-20">
        {/* SUMMARY (on top for small screens, on right for large) */}
        <div className="w-full xl:w-[480px] 2xl:w-[420px] xl:sticky xl:top-32 mb-10 xl:mb-0 xl:order-2">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center w-full">
                <div className="flex-grow-0 flex flex-col max-w-[calc(100%-140px)]">
                  <div className="text-left font-medium">
                    {translation.nameOfProject}:
                  </div>
                  <div className="text-left break-words">
                    {project?.projectName}
                  </div>
                </div>
                <button
                  className="w-[49%] bg-fisma-blue hover:bg-fisma-dark-blue text-white px-4 py-3 text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis"
                  onClick={() => {
                    setCollapseAll((prev) => !prev);
                  }}
                >
                  {collapseAll
                    ? translation.expandAll
                    : translation.collapseAll}
                </button>
              </div>
              {isLatest ? (
                <div className="flex flex-row gap-2 w-full">
                  <button
                    className={`w-full ${
                      !loadingProject
                        ? "bg-fisma-blue hover:bg-fisma-dark-blue cursor-pointer"
                        : "bg-fisma-gray"
                    } text-white text-xs py-3 px-4`}
                    onClick={() => saveProject()}
                    disabled={loadingProject}
                  >
                    {translation.saveProject}
                  </button>
                  <button
                    className={`w-full ${
                      !loadingProject
                        ? "bg-fisma-blue hover:bg-fisma-dark-blue cursor-pointer"
                        : "bg-fisma-gray"
                    } text-white text-xs py-3 px-4`}
                    onClick={() => setConfirmModalOpen(true)}
                    disabled={loadingProject}
                  >
                    {translation.archiveProjectAsVersion} {project?.version}
                  </button>
                </div>
              ) : (
                <div className="flex flex-row gap-2 w-full">
                  <div
                    role="status"
                    className="text-center w-full bg-fisma-red text-white text-xs py-3 px-4"
                  >
                    {translation.cannotEditOrSaveArchivedVersion}
                  </div>
                </div>
              )}
              <label
                htmlFor="version-select"
                className="text-sm font-medium mt-2"
              >
                {translation.selectProjectVersion}
              </label>
              <select
                id="version-select"
                className="border-2 border-gray-400 px-4 py-4 cursor-pointer mb-2"
                onChange={handleVersionSelect}
                value={project?.id || ""}
                disabled={loadingProject}
              >
                {allProjectVersions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {translation.version} {project.version}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateFunctionalComponent}
                className={`${
                  isLatest || !loadingProject
                    ? "bg-fisma-blue hover:bg-fisma-dark-blue cursor-pointer"
                    : "bg-fisma-gray"
                } text-white py-3 px-4`}
                disabled={!isLatest || loadingProject}
              >
                {translation.newFunctionalComponent}
              </button>
            </div>

            {Array.isArray(project?.functionalComponents) &&
              project.functionalComponents.length > 0 && (
                <FunctionalPointSummary
                  project={project}
                  saveProject={saveProject}
                />
              )}

            {commitSha && (
              <div className="text-[11px] text-gray-500 mt-2 break-all">
                Github commit Sha:{" "}
                <code className="font-mono">{commitSha}</code>
              </div>
            )}
          </div>
        </div>

        {/* FUNCTIONAL COMPONENTS (below on mobile, left on large screens) */}
        <div className="flex-1 xl:pr-5 xl:order-1">
          {project ? (
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedComponents.map((c) => c.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {sortedComponents?.map((component) => (
                    <SortableFunctionalComponent
                      key={component.id}
                      component={component}
                      project={project}
                      setProject={setProject}
                      setProjectResponse={setProjectResponse}
                      deleteFunctionalComponent={
                        handleDeleteFunctionalComponent
                      }
                      isLatest={isLatest}
                      collapsed={getComponentCollapseState(component.id)}
                      onCollapseChange={updateComponentCollapseState}
                      debouncedSaveProject={debouncedSaveProject}
                      onMLAToggle={handleMLAToggle}
                    />
                  ))}
                </div>

                {sortedComponents.length === 0 && (
                  <p className="text-gray-500 p-4">
                    {translation.noFunctionalComponents}
                  </p>
                )}
                <div ref={bottomRef} />
              </SortableContext>
            </DndContext>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <p></p>
          )}
        </div>

        <ConfirmModal
          message={`${translation.archiveVersionWarningBeginning} ${project?.version}? ${translation.archiveVersionWarningEnd}`}
          open={isConfirmModalOpen}
          setOpen={setConfirmModalOpen}
          onConfirm={() => saveProjectVersion()}
        />
      </div>
    </>
  );
}
