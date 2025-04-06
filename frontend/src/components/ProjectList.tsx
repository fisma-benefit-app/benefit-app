import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Project } from "../lib/types.ts";
import LoadingSpinner from "./LoadingSpinner.tsx";
import useTranslations from "../hooks/useTranslations.ts";
import useProjects from "../hooks/useProjects.tsx";

export default function ProjectList() {
  const { sortedProjects, loading, handleDelete } = useProjects();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
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

  if (loading) return <LoadingSpinner/>;

  // if (error) return <p className="fixed top-0 left-0 w-full h-full flex items-center justify-center">Error: {error}</p>;
  //TODO: Error page for generic errors?

  return (
      <div className="flex flex-col items-center h-screen p-4 pt-20">
          <input
              type="text"
              placeholder={translation.searchPlaceholder}
              className="mb-4 p-2 border-2 border-gray-400 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
          <table className="w-auto border-collapse">
              <thead>
              <tr>
                  <th className="bg-fisma-blue border-2 border-fisma-blue p-3 text-left text-white">{translation.projectName}</th>
                  <th className="bg-fisma-chathams-blue border-2 border-fisma-chathams-blue p-3 text-left text-white">{translation.version}</th>
                  <th className="bg-fisma-dark-blue border-2 border-fisma-dark-blue p-3 text-left text-white">{translation.createdAt}</th>
                  <th className="bg-fisma-chathams-blue border-2 border-fisma-chathams-blue p-3 text-left text-white">{translation.versionCreatedAt}</th>
                  <th className="bg-fisma-blue border-2 border-fisma-blue p-3 text-left text-white">{translation.modifiedAt}</th>
              </tr>
              </thead>
              <tbody>
              {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                      <tr key={project.id}>
                          <td className="border-2 border-gray-400 p-1">
                              {project.projectName}
                          </td>
                          <td className="border-2 border-gray-400 p-1">v{project.version}</td>
                          <td className="border-2 border-gray-400 p-1">
                              {new Date(project.createdDate).toLocaleDateString("fi-FI", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                              })}{" "}
                              {new Date(project.createdDate).toLocaleTimeString("fi-FI", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                              }).replace('.', ':')}
                          </td>
                          <td className="border-2 border-gray-400 p-1">
                              {new Date(project.versionDate).toLocaleDateString("fi-FI", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                              })}{" "}
                              {new Date(project.versionDate).toLocaleTimeString("fi-FI", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                              }).replace('.', ':')}
                          </td>
                          <td className="border-2 border-gray-400 p-1">
                              {new Date(project.editedDate).toLocaleDateString("fi-FI", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                              })}{" "}
                              {new Date(project.editedDate).toLocaleTimeString("fi-FI", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                              }).replace('.', ':')}
                          </td>
                          <td className="p-1">
                              <button
                                  className="bg-fisma-blue hover:bg-fisma-dark-blue cursor-pointer rounded text-white py-1 px-3"
                                  onClick={() => navigate(`/project/${project.id}`)}
                              >
                                  <FontAwesomeIcon icon={faPenToSquare}/>
                              </button>
                              <button
                                  className="bg-fisma-red hover:brightness-130 cursor-pointer rounded text-white py-1 px-3 ml-1"
                                  onClick={() => handleDelete(project.id, project.projectName)}
                              >
                                  <FontAwesomeIcon icon={faTrash}/>
                              </button>
                          </td>
                      </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan={5}
                          className="text-center text-fisma-gray p-4">{translation.noProjectsCouldBeFound}</td>
                  </tr>
              )}
              </tbody>
          </table>
      </div>
  );
} 