import { Project, ProjectWithUpdate } from "../lib/types";
const API_URL =  import.meta.env.VITE_API_URL;

const fetchAllProjects = async (sessionToken: string | null) => {

    if (!sessionToken) throw new Error("User needs to be logged in to fetch projects!");

    const fetchURL = `${API_URL}/projects`;
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

const fetchProject = async (sessionToken: string | null, projectId: number | undefined) => {

    if (!sessionToken) throw new Error("User needs to be logged in to fetch projects!");
    if (!projectId) throw new Error("Request needs the id of the project!");

    const fetchURL = `${API_URL}/projects/${projectId}`;
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

const createProject = async (sessionToken: string | null, nameForProject: string | null) => {
    if (!sessionToken) throw new Error("User needs to be logged in to create a project!");
    if (!nameForProject) throw new Error("New project needs a name!");

    const fetchURL = `${API_URL}/projects`;
    const headers = {
        "Authorization": sessionToken,
        "Content-Type": "application/json"
    };

    const project = {
        projectName: nameForProject,
        version: 1
    };

    try {
        const response = await fetch(fetchURL, { 
            method: "POST", 
            headers, 
            body: JSON.stringify(project) 
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const location = response.headers.get("Location");

        if (!location) {
            throw new Error("Project created but no Location header found!");
        } 

        const parts = location.split("projects/");
        const newProjectId = parts.length > 1 ? parts[1] : null;

        if (!newProjectId) {
            throw new Error("Id of new project could not be parsed!");
        } else return newProjectId;
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
}

const updateProject = async (sessionToken: string | null, project: Project | ProjectWithUpdate) => {

    if (!sessionToken) throw new Error("User needs to be logged in to update project!");

    const fetchURL = `${API_URL}/projects/${project.id}`;
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

const deleteProject = async (sessionToken: string | null, projectId: number | undefined) => {

    if (!sessionToken) throw new Error("User needs to be logged in to delete project!");
    if (!projectId) throw new Error("Request needs the id of the project!");

    const fetchURL = `${API_URL}/projects/${projectId}`;
    const headers = {
        "Authorization": sessionToken
    }

    try {
        const response = await fetch(fetchURL, { method: "DELETE", headers })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error deleting project:", error);
        throw error;
    }
}

export {
    fetchAllProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject
}