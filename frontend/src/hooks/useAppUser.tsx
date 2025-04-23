import { useContext } from "react";
import { AppUserContext } from "../context/AppUserContext";

const useAppUser = () => {
    const context = useContext(AppUserContext);

    if (!context) {
        throw new Error("Use this hook within the AppUserProvider component!")
    }

    return context;
}

export default useAppUser;