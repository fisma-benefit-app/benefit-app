import { apiURL } from "../constants/constants"

//api calls for project crud operations

const fetchAllProjects = async (sessionToken: string | null) => {

    if (!sessionToken) throw new Error("User needs to be logged in to fetch projects!");

    const fetchURL = `${apiURL}/projects`;
    const headers = {
        "Authorization": `Bearer ${sessionToken}`
    }

    try {
        const response = await fetch(fetchURL, { method: "GET", headers })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        console.log(response);
        const projects = await response.json();
        console.log(projects);
    } catch (error) {
        console.error("Error fetching projects: ", error);
    }
}

export {
    fetchAllProjects
}