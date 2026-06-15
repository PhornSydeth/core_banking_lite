import React from "react";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

const AboutUs: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
            <Header />
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">About CoreBanking Lite</h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        We are redefining digital finance by providing a seamless, secure, and intuitive banking experience for individuals and businesses globally.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="bg-blue-600 rounded-3xl h-80 flex items-center justify-center text-white shadow-xl relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
                            <svg className="w-32 h-32 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                        <p className="text-gray-600 mb-6 text-lg">
                            At CoreBanking Lite, our mission is to democratize access to world-class financial services. We believe that managing your money should be straightforward, transparent, and completely secure.
                        </p>
                        <p className="text-gray-600 mb-6 text-lg">
                            Founded in 2026, we have built a modern infrastructure that eliminates the friction of traditional banking. Whether you are opening your first checking account, monitoring live global currency pairs, or growing your wealth, CoreBanking Lite is built to scale with you.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-blue-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-gray-700 font-medium">Bank-grade security and encryption</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-blue-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-gray-700 font-medium">24/7 real-time transaction monitoring</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-blue-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-gray-700 font-medium">Zero hidden fees, complete transparency</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AboutUs;
