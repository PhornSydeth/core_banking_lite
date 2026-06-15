import React, { useState, useEffect } from "react";
import { AuthService } from "../service/authService.ts"
import {useAuth} from "../context/AuthContext.tsx";
import {useNavigate} from "react-router";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import { extractErrorMessage } from "../utils/errorHandler.ts";

const RegisterForm: React.FC = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const {login}=useAuth() as any;
    const navigate =useNavigate();

    // State for the alert message
    const [alert, setAlert] = useState<{ msg: string; type: "error" | "success" } | null>(null);

    // Auto-hide alert after 3 seconds
    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => setAlert(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Client-side validation for password length
        if (formData.password.length < 8) {
            setAlert({ msg: "Password should be at least 8 characters", type: "error" });
            return;
        }

        try {
            const data = await AuthService.register(formData);
            login(data);
            setAlert({ msg: "Successfully registered!", type: "success" });
            console.log("Success:", data);

            setTimeout(()=>navigate("/dashboard"),1500)
        } catch (err: any) {
            // 2. Handle existing user error from backend
            const errorMsg = extractErrorMessage(err, "User already taken or server error");
            setAlert({ msg: errorMsg, type: "error" });
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
            <Header />
            <main className="flex-grow flex items-center justify-center relative py-12 bg-gradient-to-tr from-blue-50 to-indigo-100 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-10 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-10 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="absolute -bottom-8 right-1/3 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

                <div className="relative w-full max-w-md z-10 px-4">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 sm:p-10 rounded-3xl shadow-2xl">
                        <div className="mb-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 shadow-inner ring-4 ring-white">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Open an Account</h2>
                            <p className="mt-2 text-sm text-gray-500">Join CoreBanking Lite and manage your money efficiently.</p>
                        </div>

                        {/* Beautiful Inline Alert */}
                        {alert && (
                            <div className={`mb-6 p-4 rounded-xl border flex items-start space-x-3 transition-all duration-300 ${
                                alert.type === "error" 
                                    ? "bg-red-50 border-red-200 text-red-800" 
                                    : "bg-green-50 border-green-200 text-green-800"
                            }`}>
                                <div className="flex-shrink-0 mt-0.5">
                                    {alert.type === "error" ? (
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`text-sm font-bold ${alert.type === "error" ? "text-red-800" : "text-green-800"}`}>
                                        {alert.type === "error" ? "Authentication Error" : "Success"}
                                    </h3>
                                    <p className={`mt-1 text-sm ${alert.type === "error" ? "text-red-600" : "text-green-600"}`}>
                                        {alert.msg}
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="johndoe"
                                        className="pl-10 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="pl-10 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min. 8 characters"
                                        className="pl-10 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Create Account
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account? <a href="/login" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">Log in now</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default RegisterForm;
