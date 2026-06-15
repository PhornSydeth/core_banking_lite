import React from "react";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

const Support: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
            <Header />
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">How can we help?</h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Our dedicated support team is available around the clock to assist you with your CoreBanking Lite accounts.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
                        <p className="text-gray-500 mb-4">Chat with our customer service team in real-time.</p>
                        <button className="text-blue-600 font-semibold hover:text-blue-700">Start a chat &rarr;</button>
                    </div>
                    
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
                        <p className="text-gray-500 mb-4">Send us a detailed message and we'll reply within 24 hours.</p>
                        <button className="text-indigo-600 font-semibold hover:text-indigo-700">support@corebanking.com</button>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
                        <p className="text-gray-500 mb-4">Call our global hotline for urgent banking matters.</p>
                        <button className="text-purple-600 font-semibold hover:text-purple-700">+1 (800) 123-4567</button>
                    </div>
                </div>
                
                {/* FAQ Section Placeholder */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <div className="border-b border-gray-100 pb-4">
                            <h4 className="font-semibold text-gray-800 text-lg mb-2">How do I reset my password?</h4>
                            <p className="text-gray-600">You can reset your password by clicking "Forgot Password" on the login screen. A secure link will be sent to your registered email address.</p>
                        </div>
                        <div className="border-b border-gray-100 pb-4">
                            <h4 className="font-semibold text-gray-800 text-lg mb-2">Are there fees for foreign exchange?</h4>
                            <p className="text-gray-600">We pride ourselves on offering transparent pricing. Exchange fees are included in the spread. Check our Currency Pairs page for live indicative rates.</p>
                        </div>
                        <div className="pb-4">
                            <h4 className="font-semibold text-gray-800 text-lg mb-2">How do I open a new account?</h4>
                            <p className="text-gray-600">Click on "Open Account" in the top navigation bar, fill in your details, and you can be banking with us in less than 5 minutes.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Support;
