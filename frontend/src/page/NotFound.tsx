import React from "react";
import { Link } from "react-router";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
            <Header />
            <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-20 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                
                <div className="relative z-10 text-center bg-white/80 backdrop-blur-xl border border-white/50 p-10 sm:p-16 rounded-3xl shadow-2xl max-w-2xl w-full">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 text-blue-600 mb-8 shadow-inner ring-8 ring-white">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    
                    <h1 className="text-7xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 drop-shadow-sm">
                        404
                    </h1>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
                        Page Not Found
                    </h2>
                    
                    <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto">
                        Oops! It seems you've ventured into unknown territory. The page you're looking for doesn't exist, has been moved, or you might need to log in to access it.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            to="/" 
                            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Return to Homepage
                        </Link>
                        <Link 
                            to="/login" 
                            className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 font-bold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NotFound;
