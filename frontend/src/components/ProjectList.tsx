import {
  type AriaAttributes,
  type KeyboardEvent,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Project } from "../lib/types.ts";
import LoadingSpinner from "./LoadingSpinner.tsx";
import ConfirmModal from "./ConfirmModal.tsx";
import EditProjectModal from "./EditProjectModal.tsx";
import useTranslations from "../hooks/useTranslations.ts";
import useProjects from "../hooks/useProjects.tsx";
import useCommitSha from "../hooks/useCommitSha";

type SortKey =
  | "projectName"
  | "version"
  | "createdAt"
  | "versionCreatedAt"
  | "updatedAt";

type SortDirection = "asc" | "desc";

export default function ProjectList() {
  const { sortedProjects, loading, handleDelete, handleUpdate } = useProjects();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editProjectName, setEditProjectName] = useState<string>("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDirection } | null>(
    {
      key: "updatedAt",
      dir: "desc",
    },
  );
  const commitSha = useCommitSha("-");

  const navigate = useNavigate();
  const translation = useTranslations();
  const projectListTranslation = translation.projectList;

  const getLatestVersion = (projects: Project[]) => {
    const projectMap = new Map<string, Project>();
    projects.forEach((project) => {
      const existing = projectMap.get(project.projectName);
      if (!existing || project.version > existing.version) {
        projectMap.set(project.projectName, project);
      }
    });
    return Array.from(projectMap.values());
  };

  const getSortValue = (project: Project, key: SortKey) => {
    switch (key) {
      case "projectName":
        return project.projectName;
      case "version":
        return project.version;
      case "createdAt":
        return new Date(project.createdAt).getTime();
      case "versionCreatedAt":
        return new Date(project.versionCreatedAt).getTime();
      case "updatedAt":
        return new Date(project.updatedAt).getTime();
      default: {
        const exhaustiveCheck: never = key;
        return exhaustiveCheck;
      }
    }
  };

  const toggleSort = (key: SortKey) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  };

  const onHeaderKeyDown = (key: SortKey) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSort(key);
    }
  };

  const sortableHeaderClassName =
    "bg-fisma-blue p-3 text-left text-white whitespace-nowrap cursor-pointer hover:bg-fisma-dark-blue transition-colors";

  const displayedProjects = useMemo(() => {
    const latestProjects = getLatestVersion(sortedProjects);

    const filtered =
      searchTerm.trim() === ""
        ? latestProjects
        : latestProjects.filter((project) =>
            project.projectName
              .toLowerCase()
              .includes(searchTerm.trim().toLowerCase()),
          );

    if (!sort) return filtered;

    const dirFactor = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const aValue = getSortValue(a, sort.key);
      const bValue = getSortValue(b, sort.key);

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue, "fi") * dirFactor;
      }

      return (Number(aValue) - Number(bValue)) * dirFactor;
    });
  }, [searchTerm, sort, sortedProjects]);

  const sortArrow = (key: SortKey) => {
    if (!sort || sort.key !== key) return null;
    return (
      <FontAwesomeIcon
        icon={sort.dir === "asc" ? faChevronUp : faChevronDown}
        className="ml-1 text-xs"
      />
    );
  };

  const ariaSort = (key: SortKey): AriaAttributes["aria-sort"] => {
    if (!sort || sort.key !== key) return "none";
    return sort.dir === "asc" ? "ascending" : "descending";
  };

  const sortableColumns: Array<{
    key: SortKey;
    label: string;
    widthClassName: string;
  }> = [
    {
      key: "projectName",
      label: projectListTranslation.projectName,
      widthClassName: "w-1/5",
    },
    {
      key: "version",
      label: projectListTranslation.version,
      widthClassName: "w-1/12",
    },
    {
      key: "createdAt",
      label: projectListTranslation.createdAt,
      widthClassName: "w-1/5",
    },
    {
      key: "versionCreatedAt",
      label: projectListTranslation.versionCreatedAt,
      widthClassName: "w-1/5",
    },
    {
      key: "updatedAt",
      label: projectListTranslation.modifiedAt,
      widthClassName: "w-1/5",
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col h-screen p-4 pt-20">
      <input
        type="text"
        placeholder={projectListTranslation.searchPlaceholder}
        className="mb-4 p-2 border-2 border-gray-400 w-full max-w-100 self-center"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="overflow-x-auto w-full">
        <table className="min-w-full table-fixed border-collapse">
          <thead>
            <tr>
              {sortableColumns.map((col) => (
                <th
                  key={col.key}
                  className={`${sortableHeaderClassName} ${col.widthClassName}`}
                  aria-sort={ariaSort(col.key)}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleSort(col.key)}
                  onKeyDown={onHeaderKeyDown(col.key)}
                >
                  <div className="flex items-center select-none">
                    {col.label}
                    {sortArrow(col.key)}
                  </div>
                </th>
              ))}
              <th className="bg-fisma-blue p-3 text-left text-white whitespace-nowrap w-1/5">
                <div className="flex items-center">
                  <span className="text-sm">
                    {projectListTranslation.actions}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedProjects.length > 0 ? (
              displayedProjects.map((project) => (
                <tr
                  key={project.id}
                  className="cursor-pointer hover:bg-blue-200 transition-colors"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedProject(project);
                    navigate(`/project/${project.id}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedProject(project);
                      navigate(`/project/${project.id}`);
                    }
                  }}
                >
                  <td className="border-b-2 border-fisma-light-gray p-1 whitespace-nowrap overflow-hidden truncate">
                    {project.projectName}
                  </td>
                  <td className="border-b-2 border-fisma-light-gray p-1 whitespace-nowrap">
                    v{project.version}
                  </td>
                  <td className="border-b-2 border-fisma-light-gray p-1 whitespace-nowrap">
                    {new Date(project.createdAt).toLocaleDateString("fi-FI", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}{" "}
                    {new Date(project.createdAt)
                      .toLocaleTimeString("fi-FI", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                      .replace(".", ":")}
                  </td>
                  <td className="border-b-2 border-fisma-light-gray p-1 whitespace-nowrap">
                    {new Date(project.versionCreatedAt).toLocaleDateString(
                      "fi-FI",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      },
                    )}{" "}
                    {new Date(project.versionCreatedAt)
                      .toLocaleTimeString("fi-FI", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                      .replace(".", ":")}
                  </td>
                  <td className="border-b-2 border-fisma-light-gray p-1 whitespace-nowrap">
                    {new Date(project.updatedAt).toLocaleDateString("fi-FI", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}{" "}
                    {new Date(project.updatedAt)
                      .toLocaleTimeString("fi-FI", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                      .replace(".", ":")}
                  </td>
                  <td className="border-b-2 border-fisma-light-gray p-1 whitespace-nowrap w-[90px]">
                    <button
                      className="bg-fisma-blue hover:bg-fisma-dark-blue text-white py-2 px-3"
                      title={projectListTranslation.edit}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                        setEditProjectName(project.projectName);
                        setEditModalOpen(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button
                      className="bg-fisma-red hover:brightness-130 text-white py-2 px-3 ml-1"
                      title={projectListTranslation.delete}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-fisma-gray p-4">
                  {projectListTranslation.noProjectsCouldBeFound}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {commitSha && (
          <div className="text-[11px] text-gray-500 mt-2 break-all">
            {projectListTranslation.githubCommitSha}
            <code className="font-mono">{commitSha}</code>
          </div>
        )}
      </div>
      <ConfirmModal
        message={`${projectListTranslation.confirmDelete} "${selectedProject?.projectName}"?`}
        open={isConfirmModalOpen}
        setOpen={setConfirmModalOpen}
        onConfirm={() => {
          if (selectedProject) handleDelete(selectedProject.id);
          setSelectedProject(null);
        }}
      />
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedProject(null);
          setEditProjectName("");
        }}
        selectedProject={selectedProject}
        editProjectName={editProjectName}
        onEditProjectNameChange={setEditProjectName}
        onSave={async () => {
          if (selectedProject && editProjectName.trim()) {
            await handleUpdate({
              ...selectedProject,
              projectName: editProjectName.trim(),
            });
            setEditModalOpen(false);
            setSelectedProject(null);
            setEditProjectName("");
          }
        }}
      />
    </div>
  );
}
