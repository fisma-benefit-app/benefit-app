import { createContext, ReactNode, useEffect, useState } from "react"

//TODO: add logic for session token and handling it when the application is started

type AppUserContextType = {
    appUser: AppUser | null,
    loggedIn: boolean,
    sessionToken: string | null,
    setSessionToken: React.Dispatch<React.SetStateAction<string | null>>,
    setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
    setAppUser: React.Dispatch<React.SetStateAction<AppUser | null>>
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
        setSessionToken,
        setLoggedIn,
        setAppUser
    }

    //get login data from the session storage when application is refreshed
    useEffect(() => {
        const loginToken = sessionStorage.getItem("loginToken");
        const userInfo = sessionStorage.getItem("userInfo");

        if (loginToken && userInfo) {
            setSessionToken(loginToken);
            setAppUser({ username: userInfo });
            setLoggedIn(true);
        }
    }, [])

    return (
        <AppUserContext.Provider value={appUserProviderValue}>
            {children}
        </AppUserContext.Provider>
    )
}

export default AppUserProvider;