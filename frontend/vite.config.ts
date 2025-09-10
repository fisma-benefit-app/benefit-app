import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables with prefix "VITE_"
  const env = loadEnv(mode, process.cwd());

  // Ensure VITE_API_URL is set
  if (!env.VITE_API_URL) {
    throw new Error(`VITE_API_URL is not set in your .env.${mode} file!`);
  }

  return {
    base: "/benefit-app/",
    plugins: [react(), tailwindcss()],
    server: {
      host: true, // listen on 0.0.0.0 so Docker can expose it
      port: Number(env.VITE_PORT) || 5173,
      strictPort: true,
      watch: {
        usePolling: env.CHOKIDAR_USEPOLLING === "true",
      },
    },
    define: {
      // make env available in the client code if needed
      "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
    },
  };
});
