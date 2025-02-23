import { apiURL } from "../constants/constants"
import { Project } from "../lib/types";

//api calls for project crud operations

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

const updateProject = async (sessionToken: string | null, project: Project) => {

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
    updateProject
}