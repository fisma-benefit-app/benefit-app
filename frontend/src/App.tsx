import { Navigate, Route, Routes } from "react-router";
import Footer from "./components/Footer.tsx";
import Header from "./components/Header.tsx";
import LoginForm from "./components/LoginForm.tsx";
import ProjectPage from "./components/ProjectPage.tsx";
import ProtectedLayout from "./components/ProtectedLayout.tsx";
import useAppUser from "./hooks/useAppUser.tsx";

export default function App() {

  const { loadingAuth, loggedIn } = useAppUser();

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <svg className="animate-spin h-12 w-12" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="blue" strokeWidth="4" strokeDasharray="31.4" strokeLinecap="round"></circle>
        </svg>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={loggedIn ? <Navigate to="/" /> : <LoginForm />} />

        <Route element={<ProtectedLayout loggedIn={loggedIn} />} >
          <Route path="/project/:selectedProjectId" element={<ProjectPage />} />
        </Route>

        <Route path="*" element={<Navigate to={loggedIn ? "/" : "/login"} />} />
      </Routes>
      <Footer />
    </>
  )
}