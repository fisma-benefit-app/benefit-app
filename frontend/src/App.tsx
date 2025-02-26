import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import ProjectPage from "./components/ProjectPage.tsx";
import { Routes, Route, Navigate } from "react-router";
import useAppUser from "./hooks/useAppUser.tsx";
import LoginForm from "./components/LoginForm.tsx";
import Project from "./components/Project.tsx";

export default function App() {

  const { loadingAuth, loggedIn } = useAppUser()

  //TODO: Refactor structure?
  return (
    <>
      <Header />
      <main className="pt-20 pb-20 flex justify-center">
        {loadingAuth ? (
          //TODO: probably should have some better loading screen
          <p>Checking login...</p>
        ) : (
          <Routes>
            {/* If user is logged in, show the page, if not, go to login page */}
            <Route path="/" element={loggedIn ? <Project /> : <Navigate to="/login" />} />
            <Route path="/project/:selectedProjectId" element={loggedIn ? <ProjectPage /> : <Navigate to="/login" />} />
            {/* If user is logged in, go to main page, if not, show login form */}
            <Route path="/login" element={loggedIn ? <Navigate to="/" /> : <LoginForm />} />
          </Routes>
        )}
      </main>
      <Footer />
    </>
  )
}