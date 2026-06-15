import React from "react";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Hero from "../components/Hero.tsx";
import Features from "../components/Features.tsx";

const Home: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
            <Header />

            {/* Main Content */}
            <main className="flex-grow">
                <Hero />
                <Features />
            </main>

            <Footer />
        </div>
    );
};

export default Home;
