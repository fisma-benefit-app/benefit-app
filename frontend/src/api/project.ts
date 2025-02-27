import { apiURL } from "../constants/constants"
import { Project, ProjectWithUpdate } from "../lib/types";

const fetchAllProjects = async (sessionToken: string | null) => {

    if (!sessionToken) throw new Error("User needs to be logged in to fetch projects!");

    const fetchURL = `${apiURL}/projects`;
    const headers = {
        "Authorization": sessionToken
    }

    try {
        const response = await fetch(fetchURL, { method: "GET", headers })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const projects = await response.json();
        return projects;
    } catch (error) {
        console.error("Error fetching projects:", error);
    }
}

const fetchProject = async (sessionToken: string | null, projectId: string | undefined) => {

    if (!sessionToken) throw new Error("User needs to be logged in to fetch projects!");
    if (!projectId) throw new Error("Request needs the id of the project!");

    const fetchURL = `${apiURL}/projects/${projectId}`;
    const headers = {
        "Authorization": sessionToken
    }

    try {
        const response = await fetch(fetchURL, { method: "GET", headers })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const project = await response.json();
        return project;
    } catch (error) {
        console.error("Error fetching project:", error);
        throw error;
    }
}

const updateProject = async (sessionToken: string | null, project: Project | ProjectWithUpdate) => {

    if (!sessionToken) throw new Error("User needs to be logged in to update project!");

    const fetchURL = `${apiURL}/projects/${project.id}`;
    const headers = {
        "Authorization": sessionToken,
        "Content-Type": "application/json"
    }

    try {
        const response = await fetch(fetchURL, { method: "PUT", headers, body: JSON.stringify(project) })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedProject = await response.json();
        return updatedProject;
    } catch (error) {
        console.error("Error updating project:", error);
    }
}

export {
    fetchAllProjects,
    fetchProject,
    updateProject
}