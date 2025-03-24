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