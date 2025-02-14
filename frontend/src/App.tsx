import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import Project from "./components/Project.tsx";

export default function App() {

  return (
    <>
      <Header />
      <main className="pt-20 pb-20 w-full flex justify-center">
        <Project />
      </main>
      <Footer />
    </>
  )
}