import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Project } from "../lib/types.ts";
import { fetchAllProjects } from "../api/project.ts";
import useAppUser from "../hooks/useAppUser.tsx";

export default function ProjectList() {
    const { sessionToken } = useAppUser();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const getAllProjects = async () => {
            setLoading(true);
            try {
                const allProjectsFromDb = await fetchAllProjects(sessionToken);
                setProjects(allProjectsFromDb);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unexpected error occurred when getting projects from backend.");
            } finally {
                setLoading(false);
            }
        };

        getAllProjects();
    }, []);

    //TODO: Style
    if (loading) return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
            <svg className="animate-spin h-12 w-12" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="blue" strokeWidth="4" strokeDasharray="31.4" strokeLinecap="round"></circle>
            </svg>
        </div>
    );

    if (error) return <p className="fixed top-0 left-0 w-full h-full flex items-center justify-center">Error: {error}</p>;

    return (
        <div className="flex ml-10 justify-center items-center h-screen">
            <br></br>
            <br></br>
            {/* TODO: Spacing and no projects */}
            <table className="w-auto">
                <thead>
                    <tr>
                        <th className="bg-fisma-blue border-2 border-fisma-blue p-3 text-left text-white">Projektin nimi :</th>
                        <th className="bg-fisma-chathams-blue border-2 border-fisma-chathams-blue p-3 text-left text-white">Versio :</th>
                        <th className="bg-fisma-dark-blue border-2 border-fisma-dark-blue p-3 text-left text-white">Päivämäärä :</th>
                        <th className="bg-fisma-blue border-2 border-fisma-blue p-3 text-left text-white">Kokonaispisteet :</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map((project) => (
                        <tr key={project.id} className="border">
                            <td className="border-2 border-gray-400 p-1">
                                <Link to={`/project/${project.id}`} className="text-fisma-blue hover:underline">
                                    {project.projectName}
                                </Link>
                            </td>
                            <td className="border-2 border-gray-400 p-1">v{project.version}</td>
                            <td className="border-2 border-gray-400 p-1">{new Date(project.createdDate).toLocaleDateString()}</td>
                            <td className="border-2 border-gray-400 p-1">{project.totalPoints.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
