import { Navigate, Outlet } from "react-router";

export default function ProtectedLayout({ loggedIn }: { loggedIn: boolean }) {
    if (!loggedIn) return <Navigate to="/login" />;

    return (
        <main className="flex justify-center my-20">
            <Outlet />
        </main>
    )
}