export const translations = {
    en: {
        header: {
            logout: "Logout"
        },
        loginForm: {
            header: "Log in",
            errorMessage: "Check username and password!",
            username: "Username",
            password: "Password",
            rememberMe: "Remember me",
            forgotPassword: "Did you forget password?",
            login: "Login"
        },
        newProjectModal: {
            error: "Project needs a name!",
            header: "Create a new project",
            placeholderText: "Name the project",
            cancel: "Cancel",
            createNew: "Create new"
        },
        projectList: {
            confirmDelete: "Are you sure you want to delete ",
            searchPlaceholder: "Find a project by name...",
            projectName: "Project's name",
            version: "Version",
            createdAt: "Created at",
            modifiedAt: "Modified at"
        }
    },

    fi: {
        header: {
            logout: "Kirjaudu ulos"
        },
        loginForm: {
            header: "Kirjaudu sisään",
            errorMessage: "Tarkista käyttäjänimi ja salasana!",
            username: "Käyttäjänimi",
            password: "Salasana",
            rememberMe: "Muista minut",
            forgotPassword: "Unohditko salasanan?",
            login: "Kirjaudu"
        },
        newProjectModal: {
            error: "Projekti tarvitsee nimen!",
            header: "Luo uusi projekti",
            placeholderText: "Anna projektille nimi",
            cancel: "Peruuta",
            createNew: "Luo uusi"
        },
        projectList: {
            confirmDelete: "Oletko varma, että haluat poistaa ",
            searchPlaceholder: "Etsi projekti nimellä...",
            projectName: "Projektin nimi",
            version: "Versio",
            createdAt: "Luotu",
            modifiedAt: "Muokattu"
            
        }
    },
} as const;

export type Language = keyof typeof translations;

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? `${K}` | `${K}.${NestedKeyOf<T[K]>}` : never }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<typeof translations.fi>;

// export const headerTranslations = {
//     logoutButton: {
//         fi: "Kirjaudu ulos",
//         en: "Logout"
//     },
// }