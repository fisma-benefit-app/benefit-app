import { ERROR_MESSAGES } from "../errors/messages";

const API_URL = import.meta.env.VITE_API_URL;

const fetchJWT = async (username: string, password: string) => {
  const fetchURL = `${API_URL}/token`;
  const headers = {
    //Encode user info in Base64 which is expected by the endpoint
    Authorization: `Basic ${btoa(`${username}:${password}`)}`,
  };

  try {
    const response = await fetch(fetchURL, { method: "POST", headers });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }
      throw new Error(
        `Error getting JWT in fetchJWT! Status: ${response.status}`,
      );
    }

    const token = response.headers.get("Authorization");

    if (!token) {
      throw new Error("No Authorization token received from server.");
    }

    return token;
  } catch (error) {
    // Network error or no connection to server
    if (!navigator.onLine || error instanceof TypeError) {
      throw new Error(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
    }
    // Re-throw other errors
    throw error;
  }
};

export { fetchJWT };
