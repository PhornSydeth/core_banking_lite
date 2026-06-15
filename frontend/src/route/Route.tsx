import React from "react";
import { Route, Routes } from "react-router";
import Home from "../page/Home.tsx";
import RegisterForm from "../features/register.tsx";
import Login from "../features/Login.tsx";
import Dashboard from "../page/Dashboard.tsx";
import Transactions from "../page/Transactions.tsx";
import CurrencyPair from "../page/CurrencyPair.tsx";
import AboutUs from "../page/AboutUs.tsx";
import Support from "../page/Support.tsx";
import NotFound from "../page/NotFound.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import PublicRoute from "./PublicRoute.tsx";

const AppRouter: React.FC = () => {
    return (
        <Routes>
            {/* Public Routes - Accessible by everyone */}
            <Route path="/" element={<Home />} />
            <Route path="/exchange" element={<CurrencyPair />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/support" element={<Support />} />

            {/* Auth Routes - Only accessible when NOT logged in */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterForm />} />
            </Route>

            {/* Private Routes - Only accessible when logged in */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRouter;
