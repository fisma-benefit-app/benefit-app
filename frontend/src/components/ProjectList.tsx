import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Project } from "../lib/types.ts";
import LoadingSpinner from "./LoadingSpinner.tsx";
import ConfirmModal from "./ConfirmModal.tsx";
import useTranslations from "../hooks/useTranslations.ts";
import useProjects from "../hooks/useProjects.tsx";
import useCommitSha from "../hooks/useCommitSha";

export default function ProjectList() {
  const { sortedProjects, loading, handleDelete } = useProjects();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const commitSha = useCommitSha("");

  const navigate = useNavigate();
  const translation = useTranslations().projectList;

  useEffect(() => {
    const latestProjects = getLatestVersion(sortedProjects);
    if (searchTerm === "") {
      setFilteredProjects(latestProjects);
    } else {
      setFilteredProjects(
        latestProjects.filter((project) =>
          project.projectName.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }
  }, [searchTerm, sortedProjects]);

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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col h-screen p-4 pt-20">
      <input
        type="text"
        placeholder={translation.searchPlaceholder}
        className="mb-4 p-2 border-2 border-gray-400 w-full max-w-100 self-center"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="overflow-x-auto w-full">
        <table className="min-w-full table-fixed border-collapse">
          <thead>
            <tr>
              <th className="bg-fisma-blue p-3 text-left text-white whitespace-nowrap w-1/5">
                {translation.projectName}
              </th>
              <th className="bg-fisma-blue p-3 text-left text-white whitespace-nowrap w-1/12">
                {translation.version}
              </th>
              <th className="bg-fisma-blue p-3 text-left text-white whitespace-nowrap w-1/5">
                {translation.createdAt}
              </th>
              <th className="bg-fisma-blue p-3 text-left text-white whitespace-nowrap w-1/5">
                {translation.versionCreatedAt}
              </th>
              <th className="bg-fisma-blue p-3 text-left text-white whitespace-nowrap w-1/5">
                {translation.modifiedAt}
              </th>
              <th className="bg-fisma-blue p-3 text-left text-white whitespace-nowrap w-1/5">
                <div className="flex items-center">
                  <span className="text-sm">Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
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
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/project/${project.id}`);
                      }}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button
                      className="bg-fisma-red hover:brightness-130 text-white py-2 px-3 ml-1"
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
                  {translation.noProjectsCouldBeFound}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {commitSha && (
          <div className="text-[11px] text-gray-500 mt-2 break-all">
            Github commit Sha: <code className="font-mono">{commitSha}</code>
          </div>
        )}
      </div>
      <ConfirmModal
        message={`${translation.confirmDelete} "${selectedProject?.projectName}"?`}
        open={isConfirmModalOpen}
        setOpen={setConfirmModalOpen}
        onConfirm={() => {
          if (selectedProject) handleDelete(selectedProject.id);
          setSelectedProject(null);
        }}
      />
    </div>
  );
}
