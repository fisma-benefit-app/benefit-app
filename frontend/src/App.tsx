import { Navigate, Route, Routes } from "react-router";
import LoadingSpinner from "./components/LoadingSpinner.tsx";
import Header from "./components/Header.tsx";
import LoginForm from "./components/LoginForm.tsx";
import ProjectPage from "./components/ProjectPage.tsx";
import ProjectList from "./components/ProjectList.tsx";
import ProfilePage from "./components/ProfilePage.tsx";
import ScrollToTopButton from "./components/ScrollToTopButton.tsx";
import useAppUser from "./hooks/useAppUser.tsx";
import { useState, useEffect } from "react";

export default function App() {
  const { loadingAuth, loggedIn } = useAppUser();
  const [showTestVersion, setShowTestVersion] = useState(false);

  useEffect(() => {
    const url = window.location.href;
    setShowTestVersion(url.includes("localhost") || url.includes("testing"));
  }, []);

  return (
    <div style={{ backgroundColor: showTestVersion ? "#D3D3D3" : "white" }}>
      <Header />
      <main>
        {loadingAuth ? (
          <LoadingSpinner />
        ) : (
          <Routes>
            <Route
              path="/login"
              element={loggedIn ? <Navigate to="/" /> : <LoginForm />}
            />

            <Route
              path="/"
              element={loggedIn ? <ProjectList /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={loggedIn ? <ProfilePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/project/:selectedProjectId"
              element={loggedIn ? <ProjectPage /> : <Navigate to="/login" />}
            />

            <Route
              path="*"
              element={<Navigate to={loggedIn ? "/" : "/login"} />}
            />
          </Routes>
        )}
      </main>
      <ScrollToTopButton />
    </div>
  );
}
