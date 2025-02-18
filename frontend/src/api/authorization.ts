import { apiURL } from "../constants/constants";

// api calls for user authorization

const fetchJWT = async (username: string, password: string) => {
    const fetchURL = `${apiURL}/token`;
    const headers = {
        //Encode user info in Base64 which is expected by the endpoint
        Authorization: `Basic ${btoa(`${username}:${password}`)}`
    };

    try {
        const response = await fetch(fetchURL, { method: "POST", headers });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const token = response.headers.get("Authorization");
        console.log("Token received: ", token);
        return token;
    } catch (error) {
        console.error("Login failed: ", error);
        return null;
    }
}

export {
    fetchJWT
}