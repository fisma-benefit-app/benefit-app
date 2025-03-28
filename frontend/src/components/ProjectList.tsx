import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Project } from "../lib/types.ts";
import { fetchAllProjects, deleteProject } from "../api/project.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import useTranslations from "../hooks/useTranslations.ts";

export default function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");

    const { sessionToken } = useAppUser();
    const navigate = useNavigate();
    const translation = useTranslations().projectList;

    useEffect(() => {
        const getAllProjects = async () => {
            setLoading(true);
            try {
                const allProjectsFromDb = await fetchAllProjects(sessionToken);
                const sortedProjects = allProjectsFromDb.sort((a: Project, b: Project) => new Date(b.editedDate).getTime() - new Date(a.editedDate).getTime());
                setProjects(sortedProjects);
                setFilteredProjects(allProjectsFromDb);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unexpected error occurred when getting projects from backend.");
            } finally {
                setLoading(false);
            }
        };

        getAllProjects();
    }, []);

    useEffect(() => {
        if (searchTerm === "") {
            setFilteredProjects(projects);
        } else {
            setFilteredProjects(
                projects.filter(project => project.projectName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
    }, [searchTerm, projects]);

    const handleDelete = async (projectId: number, projectName: string) => {
        if (window.confirm(`${translation.confirmDelete}"${projectName}"?`)) {
            try {
                await deleteProject(sessionToken, projectId);
                setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unexpected error occurred while trying to delete project!");
            }
        }
    };

    if (loading) return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
            <svg className="animate-spin h-12 w-12" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="blue" strokeWidth="4" strokeDasharray="31.4" strokeLinecap="round"></circle>
            </svg>
        </div>
    );

    if (error) return <p className="fixed top-0 left-0 w-full h-full flex items-center justify-center">Error: {error}</p>;

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
                                        <FontAwesomeIcon icon={faPenToSquare} />
                                    </button>
                                    <button
                                        className="bg-fisma-red hover:brightness-130 cursor-pointer rounded text-white py-1 px-3 ml-1"
                                        onClick={() => handleDelete(project.id, project.projectName)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-center text-fisma-gray p-4">Projekteja ei löytynyt.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
} 