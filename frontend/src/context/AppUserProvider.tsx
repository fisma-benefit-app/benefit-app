import { createContext, ReactNode, useState } from "react"

type AppUserContextType = {
    appUser: AppUser | null,
    loggedIn: boolean,
    sessionToken: string | null,
    setSessionToken: React.Dispatch<React.SetStateAction<string | null>>
}

type AppUserProviderProps = {
    children: ReactNode
}

type AppUser = {
    username: string,

}

export const AppUserContext = createContext<AppUserContextType | null>(null);

const AppUserProvider = ({ children }: AppUserProviderProps) => {

    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [sessionToken, setSessionToken] = useState<string | null>(null);

    const appUserProviderValue: AppUserContextType = {
        appUser,
        loggedIn,
        sessionToken,
        setSessionToken
    }

    return (
        <AppUserContext.Provider value={appUserProviderValue}>
            {children}
        </AppUserContext.Provider>
    )
}

export default AppUserProvider;