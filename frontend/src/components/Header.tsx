import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.tsx";
import { AuthService } from "../service/authService.ts";
import OtpVerificationModal from "./OtpVerificationModal.tsx";
import { extractErrorMessage } from "../utils/errorHandler.ts";

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);

    // @ts-ignore
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();

    const handleOtpVerifySuccess = async () => {
        try {
            await refreshUser();
            navigate("/");
        } catch (error) {
            console.error("Failed to refresh user data:", error);
            navigate("/");
        }
    };

    const handleLogoutConfirm = async () => {
        try {
            const response = await AuthService.logout();
            if (response) {
                logout();
                setShowLogoutConfirm(false);
                navigate("/login");
            }
        } catch (error) {
            console.error(extractErrorMessage(error, "Logout failed"));
            setShowLogoutConfirm(false);
        }
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-blue-900 tracking-tight">CoreBanking <span className="font-light text-blue-500">Lite</span></span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <Link to="/exchange" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Currency Pairs</Link>
                        <a href="/#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
                        <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About Us</Link>
                        <Link to="/support" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Support</Link>
                    </nav>

                    {/* Auth Buttons & Mobile Menu Toggle */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg border-2 border-blue-500 shadow-sm transition-transform hover:scale-105">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden md:block font-medium text-gray-700">{user.username}</span>
                                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                
                                {/* Profile Dropdown */}
                                {isProfileMenuOpen && (
                                    <>
                                        {/* Invisible backdrop to close dropdown when clicking outside */}
                                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 z-50 transform origin-top-right transition-all">
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg mt-[-8px]">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Signed in as</p>
                                                <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    {user.verified ? (
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            <span className="text-sm font-semibold text-green-700">Account Verified</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                                <span className="text-sm font-semibold text-red-700">Account Unverified</span>
                                                            </div>
                                                            <button
                                                                onClick={() => setShowOtpModal(true)}
                                                                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline transition-colors whitespace-nowrap ml-2"
                                                            >
                                                                Verify Now
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="py-2">
                                                <Link to="/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                                    <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                                    Dashboard
                                                </Link>
                                                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                                    <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    Settings
                                                </a>
                                            </div>
                                            <div className="border-t border-gray-100 py-1">
                                                <button 
                                                    onClick={() => { setIsProfileMenuOpen(false); setShowLogoutConfirm(true); }}
                                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors hidden md:block">Log In</Link>
                                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hidden md:block">
                                    Open Account
                                </Link>
                            </>
                        )}
                        {/* Mobile menu button */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0 z-40">
                    <div className="flex flex-col space-y-1 pt-2 pb-6 px-4">
                        <Link to="/exchange" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Currency Pairs</Link>
                        <a href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Features</a>
                        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">About Us</Link>
                        <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Support</Link>
                        <div className="h-px bg-gray-100 my-3"></div>
                        
                        {user ? (
                            <div className="mt-2">
                                <div className="px-3 py-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 mb-3 shadow-inner">
                                    <p className="text-xs text-blue-500 uppercase tracking-wider font-bold mb-1">Signed in as</p>
                                    <p className="font-bold text-blue-900 truncate">{user.email}</p>
                                    <div className="mt-3 pt-3 border-t border-blue-200">
                                        {user.verified ? (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm font-semibold text-green-700">Account Verified</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    <span className="text-sm font-semibold text-red-700">Account Unverified</span>
                                                </div>
                                                <button
                                                    onClick={() => { setIsMobileMenuOpen(false); setShowOtpModal(true); }}
                                                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline transition-colors whitespace-nowrap ml-2"
                                                >
                                                    Verify Now
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    Dashboard
                                </Link>
                                <button onClick={() => { setIsMobileMenuOpen(false); setShowLogoutConfirm(true); }} className="flex items-center w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 mt-1">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Log In</Link>
                                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 text-center mt-4">Open Account</Link>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity px-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm mx-auto transform transition-all border border-gray-100">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mx-auto mb-5 ring-8 ring-red-50/50">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Sign Out</h3>
                        <p className="text-center text-sm text-gray-500 mb-6">Are you sure you want to sign out of your CoreBanking Lite account?</p>
                        <div className="flex space-x-3">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors shadow-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleLogoutConfirm}
                                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* OTP Verification Modal */}
            <OtpVerificationModal
                isOpen={showOtpModal}
                userEmail={user?.email || ""}
                onClose={() => setShowOtpModal(false)}
                onVerifySuccess={handleOtpVerifySuccess}
            />
        </header>
    );
};

export default Header;
