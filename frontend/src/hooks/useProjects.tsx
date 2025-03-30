import { useContext } from "react";
import { ProjectsContext } from "../context/ProjectsContext";

const useProjects = () => {
  const context = useContext(ProjectsContext);

  if (!context) {
    throw new Error("Use this hook within the ProjectsProvider component!")
  }

  return context;
}

export default useProjects;