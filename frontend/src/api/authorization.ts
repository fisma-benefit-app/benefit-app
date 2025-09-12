const API_URL = import.meta.env.VITE_API_URL;

const fetchJWT = async (username: string, password: string) => {
  const fetchURL = `${API_URL}/token`;
  const headers = {
    //Encode user info in Base64 which is expected by the endpoint
    Authorization: `Basic ${btoa(`${username}:${password}`)}`,
  };

  const response = await fetch(fetchURL, { method: "POST", headers });

  if (!response.ok) {
    throw new Error(
      `Error getting JWT in fetchJWT! Status: ${response.status}`,
    );
  }

  const token = response.headers.get("Authorization");

  if (!token) {
    throw new Error("No Authorization token received from server.");
  }

  console.log("Token received: ", token);
  return token;
};

export { fetchJWT };
