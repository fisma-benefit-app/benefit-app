import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import Project from "./components/Project.tsx";
import { Routes, Route, Navigate } from "react-router";
import useAppUser from "./hooks/useAppUser.tsx";
import LoginForm from "./components/LoginForm.tsx";

export default function App() {

  const { loggedIn } = useAppUser()

  //TODO: Refactor structure?
  return (
    <>
      <Header />
      <main className="pt-20 pb-20">
        <Routes>
          {/* If user is logged in, show main page, if not, go to login page */}
          <Route path="/" element={loggedIn ? <Project /> : <Navigate to="/login" />} />
          {/* If user is logged in, go to main page, if not, show login form */}
          <Route path="/login" element={loggedIn ? <Navigate to="/" /> : <LoginForm />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}