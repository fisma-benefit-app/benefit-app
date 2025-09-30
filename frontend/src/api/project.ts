import { Project, TGenericComponentNoId } from "../lib/types";
const API_URL = import.meta.env.VITE_API_URL;

const fetchAllProjects = async (sessionToken: string | null) => {
  if (!sessionToken)
    throw new Error("User needs to be logged in to fetch projects!");

  const fetchURL = `${API_URL}/projects`;
  const headers = {
    Authorization: sessionToken,
  };

  const response = await fetch(fetchURL, { method: "GET", headers });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    } else {
      throw new Error(
        `Error fetching projects in fetchAllProjects! Status: ${response.status}`,
      );
    }
  }

  const projects = await response.json();
  return projects;
};

const fetchProject = async (
  sessionToken: string | null,
  projectId: number | undefined,
) => {
  if (!sessionToken)
    throw new Error("User needs to be logged in to fetch projects!");
  if (!projectId) throw new Error("Request needs the id of the project!");

  const fetchURL = `${API_URL}/projects/${projectId}`;
  const headers = {
    Authorization: sessionToken,
  };

  const response = await fetch(fetchURL, { method: "GET", headers });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    }
    throw new Error(
      `Error fetching project in fetchProject! Status: ${response.status}`,
    );
  }

  const project = await response.json();
  return project;
};

const createProject = async (
  sessionToken: string | null,
  nameForProject: string | null,
) => {
  if (!sessionToken)
    throw new Error("User needs to be logged in to create a project!");
  if (!nameForProject) throw new Error("New project needs a name!");

  const fetchURL = `${API_URL}/projects`;
  const headers = {
    Authorization: sessionToken,
    "Content-Type": "application/json",
  };

  // Build ProjectRequest DTO
  const projectRequest = {
    projectName: nameForProject,
    version: 1, // first version
    functionalComponents: [], // start empty
    appUserIds: [], // start with no users
  };

  const response = await fetch(fetchURL, {
    method: "POST",
    headers,
    body: JSON.stringify(projectRequest),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    }
    throw new Error(
      `Error creating a new project in createProject! Status: ${response.status}`,
    );
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
};

const createNewProjectVersion = async (
  sessionToken: string | null,
  previousProject: Project,
) => {
  if (!sessionToken)
    throw new Error("User needs to be logged in to create a project!");

  const fetchURL = `${API_URL}/projects/${previousProject.id}/versions`;
  const headers = {
    Authorization: sessionToken,
    "Content-Type": "application/json",
  };

  // Map Project -> ProjectRequest
  const projectRequest = {
    projectName: previousProject.projectName,
    version: previousProject.version + 1,
    functionalComponents: previousProject.functionalComponents.map((fc) => ({
      // adapt to FunctionalComponentRequest DTO
      className: fc.className,
      componentType: fc.componentType,
      dataElements: fc.dataElements,
      readingReferences: fc.readingReferences,
      writingReferences: fc.writingReferences,
      functionalMultiplier: fc.functionalMultiplier,
      operations: fc.operations,
      degreeOfCompletion: fc.degreeOfCompletion,
      title: fc.title,
      description: fc.description,
      previousFCId: fc.previousFCId,
      orderPosition: fc.orderPosition,
    })),
    appUserIds: (previousProject.appUsers ?? []).map((user) => user.appUserId),
  };

  const response = await fetch(fetchURL, {
    method: "POST",
    headers,
    body: JSON.stringify(projectRequest),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    }
    throw new Error(
      `Error creating a new project in createNewProjectVersion! Status: ${response.status}`,
    );
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
};

const updateProject = async (sessionToken: string | null, project: Project) => {
  if (!sessionToken)
    throw new Error("User needs to be logged in to update project!");

  const fetchURL = `${API_URL}/projects/${project.id}`;
  const headers = {
    Authorization: sessionToken,
    "Content-Type": "application/json",
  };

  // Map Project -> ProjectRequest
  const projectRequest = {
    projectName: project.projectName,
    version: project.version,
    functionalComponents: project.functionalComponents.map((fc) => ({
      // adapt to FunctionalComponentRequest DTO
      className: fc.className,
      componentType: fc.componentType,
      dataElements: fc.dataElements,
      readingReferences: fc.readingReferences,
      writingReferences: fc.writingReferences,
      functionalMultiplier: fc.functionalMultiplier,
      operations: fc.operations,
      degreeOfCompletion: fc.degreeOfCompletion,
      title: fc.title,
      description: fc.description,
      previousFCId: fc.previousFCId,
      orderPosition: fc.orderPosition,
    })),
    appUserIds: (project.appUsers ?? []).map((user) => user.appUserId),
  };

  const response = await fetch(fetchURL, {
    method: "PUT",
    headers,
    body: JSON.stringify(projectRequest),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    }
    throw new Error(
      `Error updating project in updateProject! Status: ${response.status}`,
    );
  }

  const updatedProject = await response.json();
  return updatedProject;
};

const deleteProject = async (
  sessionToken: string | null,
  projectId: number | undefined,
) => {
  if (!sessionToken)
    throw new Error("User needs to be logged in to delete project!");
  if (!projectId) throw new Error("Request needs the id of the project!");

  const fetchURL = `${API_URL}/projects/${projectId}`;
  const headers = {
    Authorization: sessionToken,
  };

  const response = await fetch(fetchURL, { method: "DELETE", headers });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    }
    throw new Error(
      `Error deleting project in deleteProject! Status: ${response.status}`,
    );
  }
};

const createFunctionalComponent = async (
  token: string | null,
  projectId: number | undefined,
  component: TGenericComponentNoId,
): Promise<Project> => {
  if (!token)
    throw new Error(
      "User needs to be logged in to create functional component!",
    );
  if (!projectId) throw new Error("Request needs the id of the project!");

  const fetchURL = `${API_URL}/functional-components/projects/${projectId}`;

  const headers = {
    Authorization: token,
    "Content-Type": "application/json",
  };

  const response = await fetch(fetchURL, {
    method: "POST",
    headers,
    body: JSON.stringify(component),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    }
    throw new Error(
      `Error creating a new functional component in createFunctionalComponent! Status: ${response.status}`,
    );
  }

  return response.json();
};

const deleteFunctionalComponent = async (
  token: string | null,
  componentId: number | undefined,
  projectId: number | undefined,
): Promise<Project> => {
  if (!token)
    throw new Error(
      "User needs to be logged in to delete functional component!",
    );
  if (!componentId) throw new Error("Request needs the id of the component!");
  if (!projectId) throw new Error("Request needs the id of the project!");

  const fetchURL = `${API_URL}/functional-components/${componentId}/projects/${projectId}`;
  const headers = {
    Authorization: token,
  };

  const response = await fetch(fetchURL, { method: "DELETE", headers });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    }
    throw new Error(
      `Error deleting functional component in deleteFunctionalComponent! Status: ${response.status}`,
    );
  }

  return response.json();
};

export {
  fetchAllProjects,
  fetchProject,
  createProject,
  updateProject,
  deleteProject,
  createNewProjectVersion,
  createFunctionalComponent,
  deleteFunctionalComponent,
};
