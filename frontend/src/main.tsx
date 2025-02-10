import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import Layout from "./Layout.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </Layout>
  </StrictMode>,
);
