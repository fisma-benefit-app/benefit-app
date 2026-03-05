// Centralized error handling utility

export const handleError = (err: unknown): void => {
  console.error("Error occurred:", err);

  let message = "An unexpected error occurred. Please try again later.";

  if (err instanceof TypeError) {
    if (err.message.includes("Failed to fetch")) {
      message = "Server unreachable: Please ensure the backend is running and accessible.";
    } else {
      message = "CORS error: Please check if the backend allows requests from this origin.";
    }
  } else if (err instanceof Error) {
    message = `Error: ${err.message}`;
  }

  // Display the error message to the user
  window.alert(message);
};