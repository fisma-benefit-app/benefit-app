// import * as React from "react";
// import {Project} from "../lib/types.ts";
// import useAppUser from "../hooks/useAppUser.tsx";
// import {useState} from "react";
//
// type ProjectsContext = {
//   projects: Project[];
//   isLoading: boolean;
//
// }
//
// export const ProjectsContext = React.createContext<ProjectsContext | null>(null)
//
// export default function ProjectsProvider({ children }: { children: React.ReactNode }) {
//   const { sessionToken } = useAppUser();
//   const [projects, setProjects] = useState<Project[]>([]);
//
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//
//
//
//   return <ProjectsContext.Provider value={{
//
//   }}>
//     {children}
//   </ProjectsContext.Provider>
// }
