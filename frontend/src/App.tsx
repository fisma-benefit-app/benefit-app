import { Navigate, Route, Routes } from "react-router";
import Footer from "./components/Footer.tsx";
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
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-50 z-50">
            <svg className="animate-spin h-12 w-12" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="blue" strokeWidth="4" strokeDasharray="31.4" strokeLinecap="round"></circle>
            </svg>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={loggedIn ? <Navigate to="/" /> : <LoginForm />} />

            <Route path="/" element={loggedIn ? <ProjectList /> : <Navigate to="/login" />} />
            <Route path="/project/:selectedProjectId" element={loggedIn ? <ProjectPage /> : <Navigate to="/login" />} />

            <Route path="*" element={<Navigate to={loggedIn ? "/" : "/login"} />} />
          </Routes>
        )}
      </main>
      <Footer />
    </>
  );
}
