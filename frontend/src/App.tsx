import { Navigate, Route, Routes } from "react-router";
import LoadingSpinner from "./components/LoadingSpinner.tsx";
import Header from "./components/Header.tsx";
import LoginForm from "./components/LoginForm.tsx";
import ProjectPage from "./components/ProjectPage.tsx";
import ProjectList from "./components/ProjectList.tsx";
import useAppUser from "./hooks/useAppUser.tsx";

export default function App() {
  const { loadingAuth, loggedIn } = useAppUser();

  return (
    <>
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
    </>
  );
}
