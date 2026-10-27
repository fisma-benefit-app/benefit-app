import { ChangeEvent, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faBars,
  faTimes,
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import {
  fetchAllProjects,
  fetchProject,
  updateProject,
  ConflictError,
} from "../api/project.ts";
import { generateOverviewPDF } from "../lib/overviewReportUtils.ts";
import { registerPendingSave } from "../lib/pendingSave.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import { Project, TGenericComponent } from "../lib/types.ts";
import { createNewProjectVersion } from "../api/project.ts";
import DraggableFunctionalComponent from "./DraggableFunctionalComponent.tsx";
import MasonryComponentGrid from "./MasonryComponentGrid.tsx";
import ComponentDragPreview from "./ComponentDragPreview.tsx";
import ComponentSelectionBar from "./ComponentSelectionBar.tsx";
import useComponentReorder from "../hooks/useComponentReorder.ts";
import { FunctionalPointSummary } from "./FunctionalPointSummary.tsx";
import useTranslations from "../hooks/useTranslations.ts";
import LoadingSpinner from "./LoadingSpinner.tsx";
import useProjects from "../hooks/useProjects.tsx";
import ConfirmModal from "./ConfirmModal.tsx";
import useCommitSha from "../hooks/useCommitSha";
import useFunctionalComponents from "../hooks/useFunctionalComponents.ts";
import useViewMode from "../hooks/useViewMode.ts";
import useColumnCount from "../hooks/useColumnCount.ts";
import useComponentCollapseStates from "../hooks/useComponentCollapseStates.ts";
import useDebounce from "../hooks/useDebounce.ts";
import useLanguage from "../hooks/useLanguage.tsx";

import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { enUS, fi } from "date-fns/locale";
import ShortcutTooltip from "./ShortcutTooltip.tsx";

import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useAlert } from "../hooks/useAlert.ts";
import { updateSubComponents } from "../lib/fc-service-functions.ts";
import CommentsPanel from "./CommentsPanel.tsx";
import useProjectComments from "../hooks/useProjectComments.ts";

// Keeps the sub-components of MLA components in step with their parent.
function updateMlaSubComponents(components: TGenericComponent[]) {
  return components.map((comp) =>
    comp.isMLA && comp.subComponents
      ? {
          ...comp,
          subComponents: updateSubComponents(comp, comp.subComponents),
        }
      : comp,
  );
}

function sortFunctionalComponents(components: TGenericComponent[]) {
  return components.slice().sort((a, b) => a.orderPosition - b.orderPosition);
}

function isoDateToLocalDate(isoDate: string): Date {
  const parts = isoDate.split("-").map((p) => Number(p));
  if (parts.length !== 3) {
    return new Date(isoDate);
  }

  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}

function localDateToIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export default function ProjectPage() {
  const { sessionToken, logout } = useAppUser();
  const { selectedProjectId } = useParams();
  const { setProjects, sortedProjects, checkIfLatestVersion } = useProjects();
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);
  const {
    collapseAll,
    setCollapseAll,
    descriptionRowsExpanded,
    toggleDescriptionRows,
    isCompactMode,
    toggleCompactMode,
  } = useViewMode();
  const [componentSearchQuery, setComponentSearchQuery] = useState<string>("");
  const [isSummaryMenuOpen, setIsSummaryMenuOpen] = useState<boolean>(false);
  const [includeFunctionsInReport, setIncludeFunctionsInReport] =
    useState<boolean>(false);
  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string>("");

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const projectComments = useProjectComments(sessionToken, project?.id);
  const {
    commentsOpen,
    setCommentsOpen,
    commentToDeleteId,
    setCommentToDeleteId,
    handleDeleteComment,
  } = projectComments;

  const columnCount = useColumnCount(isCompactMode, isPanelOpen);

  const translations = useTranslations();
  const translation = translations.projectPage;
  const alertTranslation = useTranslations().alert;
  const { language } = useLanguage();

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const commitSha = useCommitSha();

  const handlePrintProjectSummaryPDF = async () => {
    if (!project) return;

    const previousProject = allProjectVersions
      .filter((version) => version.version < project.version)
      .sort((a, b) => b.version - a.version)[0];

    try {
      await generateOverviewPDF(
        project,
        previousProject,
        language,
        translations.functionalClassComponent.classNameOptions,
        translations.functionalClassComponent.componentTypeOptions,
        includeFunctionsInReport,
      );
    } catch (error) {
      console.error("Failed to generate PDF", error);
    }
  };

  //get all versions of the same project
  const allProjectVersions: Project[] = sortedProjects.filter(
    (projectInArray) => project?.projectName === projectInArray.projectName,
  );

  //only allow user to edit project if it is the latest one
  const isLatest = checkIfLatestVersion(project, allProjectVersions);

  // sort functional components by order (ascending)
  const sortedComponents = project
    ? sortFunctionalComponents(project.functionalComponents)
    : [];

  // components visible in the grid: full list, narrowed by the search query
  const componentSearchQueryEmpty = componentSearchQuery.trim() === "";

  const visibleComponents = componentSearchQueryEmpty
    ? sortedComponents
    : sortedComponents.filter((component) =>
        (component.title || "")
          .toLowerCase()
          .includes(componentSearchQuery.trim().toLowerCase()),
      );

  // Alert functionality
  const { showNotification, updateNotification, hideNotification } = useAlert();

  // Flag for tracking manual saves
  const isManuallySaved = useRef(false);

  // Ref to always have the latest project state
  const projectRef = useRef<Project | null>(null);

  // Update the ref whenever project changes
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // The backend rejects a save made from an outdated copy of the project, so carry the new
  // lockVersion forward after each save. Edits made while the save was in flight stay as they are.
  const applySavedLockVersion = (saved: {
    id: number;
    lockVersion: number;
  }) => {
    const carry = (p: Project | null) =>
      p && p.id === saved.id ? { ...p, lockVersion: saved.lockVersion } : p;
    projectRef.current = carry(projectRef.current);
    setProject(carry);
  };

  // Another tab saved first. Nothing is discarded or overwritten until the user picks: this
  // tab keeps its edits, auto-save pauses, and a dialog offers the two ways forward. If the
  // other tab archived this version instead, keeping the edits cannot work, so the only way
  // forward is loading the saved version.
  const [savedElsewhere, setSavedElsewhere] = useState<Project | null>(null);
  const [versionArchivedElsewhere, setVersionArchivedElsewhere] =
    useState(false);
  // The conflict came up while archiving this version, so keeping the edits carries on with it.
  const [archivingVersion, setArchivingVersion] = useState(false);
  const saveConflictRef = useRef(false);

  const handleSaveConflict = async (
    notificationId: string,
    projectId: number,
    reason: ConflictError["reason"],
  ) => {
    saveConflictRef.current = true;
    // The dialog says what happened; an error toast would outlive it, since error toasts
    // stay until closed.
    hideNotification(notificationId);
    try {
      const saved = await fetchProject(sessionToken, projectId);
      setVersionArchivedElsewhere(reason === "notLatestVersion");
      setSavedElsewhere(saved);
    } catch (fetchErr) {
      saveConflictRef.current = false;
      console.error("Loading the project saved elsewhere failed:", fetchErr);
    }
  };

  // The one place the project is sent to the backend, for both auto-save and manual save.
  // Failures are reported through the notification (when `notify`), not thrown.
  const persistProject = async (
    currentProject: Project,
    notificationId: "auto-save" | "manual-save",
    notify: boolean,
    prepareComponents: (
      components: TGenericComponent[],
    ) => TGenericComponent[] = (components) => components,
  ) => {
    if (notify) {
      showNotification(
        alertTranslation.save,
        alertTranslation.saving,
        "loading",
        notificationId,
      );
    }

    try {
      // normalize before saving
      const normalized = prepareComponents(currentProject.functionalComponents)
        .slice()
        .sort((a, b) => a.orderPosition - b.orderPosition)
        .map((c, idx) => ({ ...c, orderPosition: idx }));
      const editedProject = {
        ...currentProject,
        functionalComponents: normalized,
      };

      applySavedLockVersion(await updateProject(sessionToken, editedProject));

      if (notify) {
        updateNotification(
          notificationId,
          alertTranslation.success,
          alertTranslation.saveSuccessful,
          "success",
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized!") {
        await logout();
      }
      if (err instanceof ConflictError) {
        await handleSaveConflict(notificationId, currentProject.id, err.reason);
        return;
      }
      if (notify) {
        updateNotification(
          notificationId,
          alertTranslation.error,
          alertTranslation.saveFailed,
          "error",
        );
      }
    }
  };

  // Debounced auto-save function
  const {
    debounced: debouncedSaveProject,
    flush: flushProjectSave,
    isPending: isProjectSavePending,
  } = useDebounce(async () => {
    const currentProject = projectRef.current;
    if (!currentProject || isManuallySaved.current || saveConflictRef.current) {
      return;
    }

    await persistProject(
      currentProject,
      "auto-save",
      true,
      updateMlaSubComponents,
    );
  }, 5000); // Auto-save every 5 seconds

  const keepMyChanges = () => {
    if (!savedElsewhere) return;
    // Their lockVersion makes this tab's next save go through, replacing the other tab's save.
    applySavedLockVersion(savedElsewhere);
    saveConflictRef.current = false;
    if (archivingVersion) {
      setArchivingVersion(false);
      void saveProjectVersion();
      return;
    }
    debouncedSaveProject();
    void flushProjectSave();
  };

  // Back to editing without choosing: nothing is saved or archived, and the conflict comes up
  // again with the next save.
  const cancelArchiving = () => {
    saveConflictRef.current = false;
    setArchivingVersion(false);
  };

  const loadSavedVersion = async () => {
    if (!savedElsewhere) return;
    setProject(savedElsewhere);
    saveConflictRef.current = false;
    setArchivingVersion(false);
    if (versionArchivedElsewhere) {
      // The version list is stale, so refresh it to make this version read-only.
      try {
        setProjects(await fetchAllProjects(sessionToken));
      } catch (err) {
        console.error("Refreshing the projects failed:", err);
      }
    }
  };

  // Let the header save waiting edits before a logout revokes the token.
  useEffect(() => registerPendingSave(flushProjectSave), [flushProjectSave]);

  // Closing or reloading the tab would drop the waiting save. Browsers show
  // their own "Leave site?" text and ignore any custom message.
  useEffect(() => {
    const warnAboutUnsavedChanges = (event: BeforeUnloadEvent) => {
      if (!isProjectSavePending()) return;
      event.preventDefault();
      event.returnValue = ""; // older Chrome needs this to show the prompt
    };

    window.addEventListener("beforeunload", warnAboutUnsavedChanges);
    return () =>
      window.removeEventListener("beforeunload", warnAboutUnsavedChanges);
  }, [isProjectSavePending]);

  // multi-select, drag and click-to-place reordering of the component grid
  const reorder = useComponentReorder({
    sortedComponents,
    visibleComponents,
    // archived versions can't be reordered, and while searching the drop
    // position in the filtered list would be ambiguous
    enabled: isLatest && componentSearchQueryEmpty,
    resetKey: selectedProjectId,
    onReorder: (reordered) => {
      setProject((prev) =>
        prev ? { ...prev, functionalComponents: reordered } : prev,
      );
      if (isLatest) {
        debouncedSaveProject();
      }
    },
  });
  const canReorder = isLatest && componentSearchQueryEmpty;
  const isPlacingSelected = canReorder && reorder.selectedCount > 0;

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

  const saveProject = async (showNotif: boolean = true) => {
    isManuallySaved.current = true;
    // The ref carries the lockVersion applied after a save conflict, which this render's
    // project does not have yet.
    const currentProject = projectRef.current;
    if (currentProject) {
      try {
        await persistProject(currentProject, "manual-save", showNotif);
      } finally {
        setTimeout(() => {
          isManuallySaved.current = false;
        }, 5000);
      }
    } else {
      isManuallySaved.current = false;
    }
  };

  const saveProjectVersion = async () => {
    if (project) {
      isManuallySaved.current = true;
      try {
        await saveProject();
        if (saveConflictRef.current) {
          // The user has to resolve the conflict first; keeping their changes resumes this.
          setArchivingVersion(true);
          return;
        }
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

  const {
    lastAddedComponentId,
    setLastAddedComponentId,
    handleMLAToggle,
    handleCreateFunctionalComponent,
    handleDeleteFunctionalComponent,
  } = useFunctionalComponents({
    project,
    setProject,
    setLoadingProject,
    setComponentSearchQuery,
    isLatest,
    isManuallySaved,
    bottomRef,
    saveProject,
    debouncedSaveProject,
  });

  const handleVersionSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedId: number = Number(e.target.value);
    const selectedProject = sortedProjects.find(
      (p: Project) => p.id === selectedId,
    );

    if (selectedProject) {
      navigate(`/project/${selectedId}`);
    }
  };

  const { updateComponentCollapseState, getComponentCollapseState } =
    useComponentCollapseStates(collapseAll, lastAddedComponentId);

  useEffect(() => {
    setLastAddedComponentId(null);
  }, [collapseAll, setLastAddedComponentId]);

  if (loadingProject) return <LoadingSpinner />;

  return (
    <>
      {/* Sticky Burger Menu Button for Mobile */}
      <div className="fixed xl:hidden top-20 right-5 z-40">
        <button
          className="bg-fisma-blue hover:bg-fisma-dark-blue text-white px-4 py-3 rounded flex items-center gap-2"
          onClick={() => setIsSummaryMenuOpen(!isSummaryMenuOpen)}
          aria-label="Toggle summary menu"
        >
          <FontAwesomeIcon icon={isSummaryMenuOpen ? faTimes : faBars} />
        </button>
      </div>

      {/* Desktop Panel Toggle Button */}
      <div
        className={`hidden xl:flex fixed top-20 mt-1 z-50 transition-all duration-300 ${isPanelOpen ? "right-[356px] 2xl:right-[416px]" : "right-0"}`}
      >
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="bg-white text-gray-500 hover:bg-gray-100 hover:text-fisma-blue w-6 h-10 rounded-l-md border border-gray-300 border-r-0 shadow-[-2px_0_5px_rgba(0,0,0,0.08)] flex items-center justify-center transition-colors"
          title={isPanelOpen ? "Close sidebar" : "Open sidebar"}
        >
          <FontAwesomeIcon
            icon={isPanelOpen ? faChevronRight : faChevronLeft}
            className="w-4 h-4"
          />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start px-5 pt-24 xl:pt-20">
        {/* SUMMARY (on top for small screens, on right for large - now with sticky dropdown on mobile) */}
        <div
          className={`${isSummaryMenuOpen ? "block" : "hidden"} ${
            !isPanelOpen
              ? "xl:hidden"
              : "xl:block xl:w-[360px] xl:shrink-0 2xl:w-[420px]"
          } fixed xl:static top-20 left-0 right-0 z-30 xl:z-auto w-full xl:sticky xl:top-20 mb-10 xl:mb-0 xl:order-2 bg-white xl:bg-transparent max-h-[calc(100vh-5rem)] overflow-y-auto px-5 xl:px-0 py-4 xl:py-0 shadow-lg xl:shadow-none transition-all duration-300`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center w-full">
                <div className="flex-grow-0 flex flex-col max-w-[calc(100%-140px)] xl:pl-8">
                  <div className="text-left font-medium">
                    {translation.nameOfProject}:
                  </div>
                  <div className="text-left break-words">
                    {project?.projectName}
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-2 w-full">
                <button
                  className={`${isCompactMode ? "w-full" : "w-[49%]"} bg-fisma-blue hover:bg-fisma-dark-blue text-white px-4 py-3 text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis`}
                  onClick={() => {
                    setCollapseAll((prev) => !prev);
                  }}
                >
                  {collapseAll
                    ? translation.expandAll
                    : translation.collapseAll}
                </button>
                {!isCompactMode && (
                  <button
                    className="w-[49%] bg-fisma-blue hover:bg-fisma-dark-blue text-white px-4 py-3 text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis"
                    onClick={toggleDescriptionRows}
                  >
                    {descriptionRowsExpanded
                      ? translation.collapseDescriptions
                      : translation.expandDescriptions}
                  </button>
                )}
              </div>
              <div className="flex w-full">
                <button
                  className="w-full bg-fisma-blue hover:bg-fisma-dark-blue text-white px-4 py-3 text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis"
                  onClick={toggleCompactMode}
                >
                  {isCompactMode
                    ? translation.disableCompactMode
                    : translation.enableCompactMode}
                </button>
              </div>
              {isLatest ? (
                <div className="flex flex-col gap-2 w-full">
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
                  <button
                    className={`w-full ${
                      !loadingProject
                        ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                        : "bg-fisma-gray"
                    } text-white text-xs py-3 px-4 flex items-center justify-center gap-2`}
                    onClick={handlePrintProjectSummaryPDF}
                    disabled={loadingProject}
                  >
                    <FontAwesomeIcon icon={faFilePdf} />
                    {translation.overviewSummaryReport}
                  </button>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeFunctionsInReport}
                      onChange={(e) =>
                        setIncludeFunctionsInReport(e.target.checked)
                      }
                    />
                    {translation.includeFunctionsInReport}
                  </label>
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

              <div className="mt-2">
                <div className="text-left font-medium">
                  {translation.calculationDate}
                </div>
                <DatePicker
                  key={language}
                  selected={
                    project?.calculationDate
                      ? isoDateToLocalDate(project.calculationDate)
                      : null
                  }
                  onChange={(date: Date | null) => {
                    const isoDate = date ? localDateToIsoDate(date) : null;

                    setProject((prev) => {
                      if (!prev) return prev;
                      const updated = { ...prev, calculationDate: isoDate };
                      projectRef.current = updated;
                      return updated;
                    });

                    if (isLatest) {
                      debouncedSaveProject();
                    }
                  }}
                  locale={language === "fi" ? fi : enUS}
                  dateFormat={language === "fi" ? "dd/MM/yyyy" : "MM/dd/yyyy"}
                  className="border-2 border-gray-400 px-3 py-2 w-full text-sm"
                  disabled={!isLatest || loadingProject}
                  isClearable
                />
              </div>

              <div className="mt-2">
                <label
                  htmlFor="report-contact-details"
                  className="text-left font-medium"
                >
                  {translation.reportContactDetails}
                </label>
                <textarea
                  id="report-contact-details"
                  value={project?.reportContactDetails ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setProject((prev) => {
                      if (!prev) return prev;
                      const updated = { ...prev, reportContactDetails: value };
                      projectRef.current = updated;
                      return updated;
                    });

                    if (isLatest) {
                      debouncedSaveProject();
                    }
                  }}
                  className="border-2 border-gray-400 px-3 py-2 w-full text-sm"
                  rows={3}
                  maxLength={2000}
                  disabled={!isLatest || loadingProject}
                />
              </div>

              <div className="mt-2">
                <label
                  htmlFor="report-calculation-notes"
                  className="text-left font-medium"
                >
                  {translation.reportNotes}
                </label>
                <textarea
                  id="report-calculation-notes"
                  value={project?.reportNotes ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;

                    setProject((prev) => {
                      if (!prev) return prev;
                      const updated = { ...prev, reportNotes: value };
                      projectRef.current = updated;
                      return updated;
                    });

                    if (isLatest) {
                      debouncedSaveProject();
                    }
                  }}
                  className="border-2 border-gray-400 px-3 py-2 w-full text-sm"
                  rows={5}
                  maxLength={5000}
                  disabled={!isLatest || loadingProject}
                />
              </div>

              <label
                htmlFor="version-select"
                className="text-sm font-medium mt-2"
              >
                {translation.selectProjectVersion}
              </label>
              <select
                id="version-select"
                className="border-2 border-gray-400 px-4 py-4 cursor-pointer mb-2 w-full"
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
                className={`w-full ${
                  isLatest || !loadingProject
                    ? "bg-fisma-blue hover:bg-fisma-dark-blue cursor-pointer"
                    : "bg-fisma-gray"
                } text-white py-3 px-4`}
                disabled={!isLatest || loadingProject}
              >
                {translation.newFunctionalComponent}
              </button>

              <button
                onClick={() => setCommentsOpen((prev) => !prev)}
                className="w-full bg-fisma-blue hover:bg-fisma-dark-blue text-white py-3 px-4 cursor-pointer"
                disabled={!project || loadingProject}
              >
                {translation.comments}
              </button>

              {commentsOpen && project && (
                <CommentsPanel comments={projectComments} isLatest={isLatest} />
              )}
            </div>

            {Array.isArray(project?.functionalComponents) &&
              project.functionalComponents.length > 0 && (
                <FunctionalPointSummary
                  project={project}
                  saveProject={saveProject}
                />
              )}
          </div>
          <div>
            {commitSha && (
              <div className="text-[11px] text-gray-500 mt-2 break-all">
                {translation.githubCommitSha}
                <code className="font-mono">{commitSha}</code>
              </div>
            )}
          </div>
        </div>

        {/* FUNCTIONAL COMPONENTS (below on mobile, left on large screens) */}
        <div className="min-w-0 flex-1 xl:pr-5 xl:order-1">
          {project ? (
            <>
              <div className="mb-4 flex items-stretch gap-2">
                {sortedComponents.length > 0 && (
                  <>
                    <ShortcutTooltip />
                    <input
                      type="text"
                      placeholder={translation.searchComponentsPlaceholder}
                      className="min-w-0 flex-1 p-2 border-2 border-gray-400"
                      value={componentSearchQuery}
                      onChange={(e) => setComponentSearchQuery(e.target.value)}
                    />
                  </>
                )}
              </div>
              {isPlacingSelected && (
                <ComponentSelectionBar
                  count={reorder.selectedCount}
                  onClear={reorder.clearSelection}
                />
              )}
              <DndContext {...reorder.dndContextProps}>
                <MasonryComponentGrid
                  items={visibleComponents}
                  columnCount={columnCount}
                  gridRef={reorder.gridRef}
                  renderItem={(component, visibleIndex) => {
                    const fullIndex = sortedComponents.indexOf(component);
                    const isLastVisible =
                      visibleIndex === visibleComponents.length - 1;
                    const showSlots = isPlacingSelected && !reorder.isDragging;
                    return (
                      <DraggableFunctionalComponent
                        component={component}
                        project={project}
                        setProject={setProject}
                        deleteFunctionalComponent={
                          handleDeleteFunctionalComponent
                        }
                        isLatest={isLatest}
                        collapsed={getComponentCollapseState(component.id)}
                        onCollapseChange={updateComponentCollapseState}
                        debouncedSaveProject={debouncedSaveProject}
                        onMLAToggle={handleMLAToggle}
                        descriptionRowsExpanded={descriptionRowsExpanded}
                        isCompactMode={isCompactMode}
                        selected={reorder.selectedIds.has(component.id)}
                        onCardClick={
                          canReorder
                            ? (e) => reorder.handleCardClick(component.id, e)
                            : undefined
                        }
                        dragDisabled={!canReorder}
                        isBeingDragged={reorder.draggedIds.includes(
                          component.id,
                        )}
                        dropIndicator={reorder.dropIndicatorFor(component.id)}
                        registerCard={reorder.registerCard}
                        placementSlots={{
                          before: showSlots ? fullIndex : null,
                          after:
                            showSlots && isLastVisible ? fullIndex + 1 : null,
                        }}
                        onPlace={reorder.placeSelected}
                      />
                    );
                  }}
                />

                {sortedComponents.length === 0 && (
                  <p className="text-gray-500 p-4">
                    {translation.noFunctionalComponents}
                  </p>
                )}
                <div
                  ref={bottomRef}
                  className={isPlacingSelected ? "h-24" : ""}
                />
                <DragOverlay dropAnimation={null}>
                  {reorder.isDragging && (
                    <ComponentDragPreview
                      component={sortedComponents.find(
                        (c) => c.id === reorder.draggedIds[0],
                      )}
                      count={reorder.draggedIds.length}
                    />
                  )}
                </DragOverlay>
              </DndContext>
            </>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <p></p>
          )}
        </div>

        <ConfirmModal
          message={
            versionArchivedElsewhere
              ? alertTranslation.versionArchivedMessage
              : archivingVersion
                ? alertTranslation.saveConflictArchiveMessage
                : alertTranslation.saveConflictMessage
          }
          open={savedElsewhere !== null}
          setOpen={(open) => {
            if (!open) setSavedElsewhere(null);
          }}
          confirmLabel={
            versionArchivedElsewhere
              ? alertTranslation.loadSavedVersion
              : archivingVersion
                ? alertTranslation.keepMyChangesAndArchive
                : alertTranslation.keepMyChanges
          }
          cancelLabel={alertTranslation.loadSavedVersion}
          onConfirm={
            versionArchivedElsewhere ? loadSavedVersion : keepMyChanges
          }
          onCancel={loadSavedVersion}
          hideCancel={versionArchivedElsewhere}
          dismissLabel={alertTranslation.cancelArchiving}
          onDismiss={
            archivingVersion && !versionArchivedElsewhere
              ? cancelArchiving
              : undefined
          }
        />

        <ConfirmModal
          message={`${translation.archiveVersionWarningBeginning} ${project?.version}? ${translation.archiveVersionWarningEnd}`}
          open={isConfirmModalOpen}
          setOpen={setConfirmModalOpen}
          onConfirm={() => saveProjectVersion()}
        />

        <ConfirmModal
          message={
            translation.deleteCommentConfirmation ??
            "Are you sure you want to delete the comment?"
          }
          open={commentToDeleteId !== null}
          setOpen={() => setCommentToDeleteId(null)}
          onConfirm={() => {
            if (commentToDeleteId !== null) {
              handleDeleteComment(commentToDeleteId);
            }
          }}
        />
      </div>
    </>
  );
}
