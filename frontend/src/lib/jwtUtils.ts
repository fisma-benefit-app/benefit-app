export interface JWTPayload {
  sub: string; // username
  userId: number;
  scope: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
}

export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // Remove "Bearer " prefix if present
    const cleanToken = token.replace(/^Bearer\s+/i, "");

    // JWT has three parts separated by dots
    const parts = cleanToken.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));

    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error("Error decoding JWT: Invalid or malformed token.");
    return null;
  }
};
