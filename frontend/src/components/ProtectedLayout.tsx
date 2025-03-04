import { Navigate, Outlet } from "react-router";

export default function ProtectedLayout({ loggedIn }: { loggedIn: boolean }) {
    if (!loggedIn) return <Navigate to="/login" />;

    return (
        <Outlet />
    )
}