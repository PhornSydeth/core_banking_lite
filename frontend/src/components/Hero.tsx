import React from "react";
import { Link } from "react-router";

const Hero: React.FC = () => {
    return (
        <section className="relative bg-blue-900 overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-800 opacity-90"></div>
                {/* Abstract background pattern */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-400 opacity-10 blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col lg:flex-row items-center">
                <div className="lg:w-1/2 text-center lg:text-left z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-800 text-blue-200 text-sm font-semibold mb-6 tracking-wide uppercase shadow-inner">
                        Secure & Reliable
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                        Banking Made <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400">Simple for Everyone</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto lg:mx-0">
                        Experience next-generation digital banking. Seamlessly manage your finances, transfer funds instantly, and enjoy top-tier security with CoreBanking Lite.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link to="/register" className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                            Get Started
                        </Link>
                        <a href="#features" className="bg-blue-800 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all border border-blue-600">
                            Learn More
                        </a>
                    </div>
                </div>
                <div className="lg:w-1/2 mt-16 lg:mt-0 z-10 relative">
                    {/* Mockup or Illustration Placeholder */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                        <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex flex-col">
                            <div className="bg-white p-4 border-b flex justify-between items-center">
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="h-4 w-32 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="p-6">
                                <div className="h-8 w-48 bg-blue-100 rounded-lg mb-6"></div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="h-24 bg-white shadow-sm rounded-xl border border-gray-100"></div>
                                    <div className="h-24 bg-white shadow-sm rounded-xl border border-gray-100"></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                                    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
