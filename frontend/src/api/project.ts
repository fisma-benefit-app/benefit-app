import { Project, ProjectWithUpdate } from "../lib/types";
const API_URL = import.meta.env.VITE_API_URL;
import CreateCurrentDate from "../api/date.ts";
import { CreateCurrentDateNewVersion } from "../api/date.ts";

const fetchAllProjects = async (sessionToken: string | null) => {

    if (!sessionToken) throw new Error("User needs to be logged in to fetch projects!");

    const fetchURL = `${API_URL}/projects`;
    const headers = {
        "Authorization": sessionToken
    }

    const response = await fetch(fetchURL, { method: "GET", headers })

    if (!response.ok) {
        throw new Error(`Error fetching projects in fetchAllProjects! Status: ${response.status}`);
    }

    const projects = await response.json();
    return projects;
}

const fetchProject = async (sessionToken: string | null, projectId: number | undefined) => {

    if (!sessionToken) throw new Error("User needs to be logged in to fetch projects!");
    if (!projectId) throw new Error("Request needs the id of the project!");

    const fetchURL = `${API_URL}/projects/${projectId}`;
    const headers = {
        "Authorization": sessionToken
    }

    const response = await fetch(fetchURL, { method: "GET", headers })

    if (!response.ok) {
        throw new Error(`Error fetching project in fetchProject! Status: ${response.status}`);
    }

    const project = await response.json();
    return project;
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
        version: 1,
        createdDate: CreateCurrentDate(),
        versionDate: CreateCurrentDate(),
        editedDate: CreateCurrentDate(),
    };

    const response = await fetch(fetchURL, {
        method: "POST",
        headers,
        body: JSON.stringify(project)
    });

    if (!response.ok) {
        throw new Error(`Error creating a new project in createProject! Status: ${response.status}`);
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
}

const createNewProjectVersion = async (sessionToken: string | null, previousProject: Project) => {
    if (!sessionToken) throw new Error("User needs to be logged in to create a project!");

    const fetchURL = `${API_URL}/projects/create-version`;
    const headers = {
        "Authorization": sessionToken,
        "Content-Type": "application/json"
    };

    const project = {
        ...previousProject,
        id: null,
        version: previousProject.version + 1,
        versionDate: CreateCurrentDateNewVersion(),
        editedDate: CreateCurrentDateNewVersion(),
    };

    const response = await fetch(fetchURL, {
        method: "POST",
        headers,
        body: JSON.stringify(project)
    });

    if (!response.ok) {
        throw new Error(`Error creating a new project in createProject! Status: ${response.status}`);
    }

    const location = response.headers.get("Location");

    if (!location) {
        throw new Error("Project created but no Location header found!");
    }

    const parts = location.split("projects/");
    const newProjectId = parts.length > 1 ? parts[1] : null;

    if (!newProjectId) {
        throw new Error("Id of new project could not be parsed!");
    }

    return newProjectId;
}


const updateProject = async (sessionToken: string | null, project: Project | ProjectWithUpdate) => {

    if (!sessionToken) throw new Error("User needs to be logged in to update project!");

    const fetchURL = `${API_URL}/projects/${project.id}`;
    const headers = {
        "Authorization": sessionToken,
        "Content-Type": "application/json"
    }

    const response = await fetch(fetchURL, { method: "PUT", headers, body: JSON.stringify(project) })

    if (!response.ok) {
        throw new Error(`Error updating project in updateProject! Status: ${response.status}`);
    }

    const updatedProject = await response.json();
    return updatedProject;
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
            throw new Error(`Error deleting project in deleteProject! Status: ${response.status}`);
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
    deleteProject,
    createNewProjectVersion
}