import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { AlertProvider } from "./context/AlertProvider.tsx";
import AppUserProvider from "./context/AppUserProvider.tsx";
import LanguageProvider from "./context/LanguageProvider.tsx";
import ProjectsProvider from "./context/ProjectsProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppUserProvider>
      <ProjectsProvider>
        <LanguageProvider>
          <AlertProvider>
            <HashRouter>
              <App />
            </HashRouter>
          </AlertProvider>
        </LanguageProvider>
      </ProjectsProvider>
    </AppUserProvider>
  </StrictMode>,
);
