import React, { useEffect, useState } from "react";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import { extractErrorMessage } from "../utils/errorHandler.ts";

interface ExchangeRates {
    [key: string]: number;
}

interface CurrencyData {
    code: string;
    name: string;
    midRate: number;
    bid: number;
    ask: number;
    trend: "up" | "down" | "neutral";
    changePercent: number;
    countryCode: string;
}

const MAJOR_CURRENCIES = [
    { code: "EUR", name: "Euro", countryCode: "eu" },
    { code: "GBP", name: "British Pound", countryCode: "gb" },
    { code: "JPY", name: "Japanese Yen", countryCode: "jp" },
    { code: "AUD", name: "Australian Dollar", countryCode: "au" },
    { code: "CAD", name: "Canadian Dollar", countryCode: "ca" },
    { code: "CHF", name: "Swiss Franc", countryCode: "ch" },
    { code: "CNY", name: "Chinese Yuan", countryCode: "cn" },
    { code: "SGD", name: "Singapore Dollar", countryCode: "sg" },
    { code: "THB", name: "Thai Baht", countryCode: "th" },
];

const API_KEY = import.meta.env.VITE_CURRENCY_API_URL;
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

const CurrencyPair: React.FC = () => {
    const [khrData, setKhrData] = useState<CurrencyData | null>(null);
    const [majorPairs, setMajorPairs] = useState<CurrencyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Simulate real-time updates and spread
    const generateSpreadData = (code: string, name: string, countryCode: string, midRate: number): CurrencyData => {
        // Typical Forex spread simulation (e.g. 0.05% to 0.2%)
        const spreadPercent = 0.001; 
        
        // Randomize trend to simulate live market feel
        const randomFactor = (Math.random() - 0.5) * 0.005; // +/- 0.25% daily change simulation
        const isUp = randomFactor >= 0;
        
        return {
            code,
            name,
            midRate,
            bid: midRate * (1 - spreadPercent),
            ask: midRate * (1 + spreadPercent),
            trend: isUp ? "up" : "down",
            changePercent: Number((Math.abs(randomFactor) * 100).toFixed(2)),
            countryCode
        };
    };

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error("Failed to fetch exchange rates.");
                }
                const data = await response.json();
                const rates: ExchangeRates = data.conversion_rates;

                if (rates) {
                    // Extract KHR specifically
                    if (rates["KHR"]) {
                        setKhrData(generateSpreadData("KHR", "Khmer Riel", "kh", rates["KHR"]));
                    }

                    // Extract Major pairs
                    const pairs = MAJOR_CURRENCIES.map(c => {
                        return generateSpreadData(c.code, c.name, c.countryCode, rates[c.code] || 1);
                    }).filter(p => p.midRate !== 1);

                    setMajorPairs(pairs);
                }
                setLoading(false);
            } catch (err: any) {
                console.error(err);
                setError(extractErrorMessage(err, "Failed to load exchange rates."));
                setLoading(false);
            }
        };

        fetchRates();

        // Simulate live ticker updates every 5 seconds
        const interval = setInterval(() => {
            setKhrData(prev => prev ? {
                ...prev,
                bid: prev.midRate * (1 - 0.001 + (Math.random() - 0.5) * 0.0002),
                ask: prev.midRate * (1 + 0.001 + (Math.random() - 0.5) * 0.0002),
            } : prev);

            setMajorPairs(prev => prev.map(p => ({
                ...p,
                bid: p.midRate * (1 - 0.001 + (Math.random() - 0.5) * 0.0002),
                ask: p.midRate * (1 + 0.001 + (Math.random() - 0.5) * 0.0002),
            })));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const formatCurrency = (val: number, isKHR: boolean = false) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: isKHR ? 0 : 4,
            maximumFractionDigits: isKHR ? 0 : 4
        }).format(val);
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
            <Header />
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
                        <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        Global Market Exchange Rates
                    </h1>
                    <p className="mt-2 text-gray-500">Live indicative foreign exchange rates against the US Dollar (USD).</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Featured Pair - USD/KHR */}
                        {khrData && (
                            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl shadow-2xl overflow-hidden mb-12 relative text-white">
                                <div className="absolute top-0 right-0 opacity-10">
                                    <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h2.45c.16 1.18 1.05 1.54 1.87 1.54 1.15 0 1.94-.65 1.94-1.57 0-.96-.75-1.4-2.45-1.87-2.12-.58-3.4-1.62-3.4-3.32 0-1.6 1.16-2.7 2.85-3.13V4h2.67v1.94c1.47.31 2.8 1.34 3.01 3.06h-2.43c-.15-.99-.95-1.4-1.79-1.4-1.01 0-1.75.58-1.75 1.48 0 .84.66 1.25 2.37 1.74 2.19.63 3.49 1.69 3.49 3.47 0 1.83-1.39 2.87-2.89 3.2V18.09z"/>
                                    </svg>
                                </div>
                                <div className="p-8 sm:p-10 relative z-10 flex flex-col md:flex-row items-center justify-between">
                                    <div className="mb-6 md:mb-0">
                                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md mb-4 border border-white/20">
                                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Live Trading</span>
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-extrabold flex items-center">
                                            <div className="flex -space-x-4 mr-4">
                                                <img src="https://flagcdn.com/w40/us.png" alt="USD" className="w-10 h-10 rounded-full border-2 border-indigo-900 object-cover shadow-sm" />
                                                <img src={`https://flagcdn.com/w40/${khrData.countryCode}.png`} alt={khrData.code} className="w-10 h-10 rounded-full border-2 border-indigo-900 object-cover shadow-sm z-10" />
                                            </div>
                                            USD / {khrData.code}
                                        </h2>
                                        <p className="text-blue-200 mt-2 text-lg">US Dollar to Khmer Riel</p>
                                    </div>
                                    
                                    <div className="flex space-x-4 md:space-x-8 w-full md:w-auto">
                                        {/* Sell / Bid Box */}
                                        <div className="flex-1 md:w-48 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
                                            <p className="text-blue-200 font-semibold mb-1 uppercase tracking-wider text-xs">Sell (Bid)</p>
                                            <p className="text-3xl font-bold text-red-400 group-hover:text-red-300 transition-colors">
                                                {formatCurrency(khrData.bid, true)}
                                            </p>
                                        </div>
                                        {/* Buy / Ask Box */}
                                        <div className="flex-1 md:w-48 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
                                            <p className="text-blue-200 font-semibold mb-1 uppercase tracking-wider text-xs">Buy (Ask)</p>
                                            <p className="text-3xl font-bold text-green-400 group-hover:text-green-300 transition-colors">
                                                {formatCurrency(khrData.ask, true)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Major Pairs Grid */}
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 border-gray-200">Major Currency Pairs</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {majorPairs.map((pair) => (
                                <div key={pair.code} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 group cursor-pointer relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center">
                                            <div className="flex -space-x-3 mr-3">
                                                <img src="https://flagcdn.com/w40/us.png" alt="USD" className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover bg-gray-100" />
                                                <img src={`https://flagcdn.com/w40/${pair.countryCode}.png`} alt={pair.code} className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover bg-gray-100 z-10" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xl text-gray-900">USD / {pair.code}</h4>
                                                <p className="text-xs text-gray-500 font-medium">{pair.name}</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center text-sm font-bold px-2 py-1 rounded-md ${pair.trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                            {pair.trend === "up" ? (
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                            ) : (
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                            )}
                                            {pair.changePercent}%
                                        </div>
                                    </div>

                                    <div className="flex justify-between space-x-3 mt-4">
                                        <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100 group-hover:border-red-100 transition-colors">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Sell</p>
                                            <p className="font-bold text-gray-800 text-lg group-hover:text-red-600 transition-colors">
                                                {formatCurrency(pair.bid)}
                                            </p>
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100 group-hover:border-green-100 transition-colors">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Buy</p>
                                            <p className="font-bold text-gray-800 text-lg group-hover:text-green-600 transition-colors">
                                                {formatCurrency(pair.ask)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CurrencyPair;
