import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables with prefix "VITE_" by default for the current mode (e.g., "development")
  const env = loadEnv(mode, process.cwd());

  // Check if VITE_API_URL is set
  if (!env.VITE_API_URL) {
    throw new Error(`VITE_API_URL is not set in your .env.${mode} file!`);
  }

  return {
    base: "/benefit-app/",
    plugins: [react(), tailwindcss()],
  };
});
