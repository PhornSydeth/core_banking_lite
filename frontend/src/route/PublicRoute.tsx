import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext.tsx";

const PublicRoute: React.FC = () => {
    // @ts-ignore
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
