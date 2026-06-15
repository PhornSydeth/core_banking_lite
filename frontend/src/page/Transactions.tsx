import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.tsx";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import { AuthService, type TransactionResponse, type AccountResponse } from "../service/authService.ts";
import { extractErrorMessage } from "../utils/errorHandler.ts";

const Transactions: React.FC = () => {
    // @ts-ignore
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
    const [accounts, setAccounts] = useState<AccountResponse[]>([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [transactionsError, setTransactionsError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

    useEffect(() => {
        if (user && user.userId) {
            const fetchData = async () => {
                setTransactionsLoading(true);
                try {
                    // Fetch both accounts and transactions
                    const [accountsData, transactionsData] = await Promise.all([
                        AuthService.getAccountsByUserId(user.userId),
                        AuthService.getTransactionsByUserId(user.userId)
                    ]);
                    
                    setAccounts(accountsData);
                    
                    // Sort by date (createdAt)
                    const sorted = [...transactionsData].sort((a, b) => {
                        const dateA = new Date(a.createdAt).getTime();
                        const dateB = new Date(b.createdAt).getTime();
                        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
                    });
                    setTransactions(sorted);
                    setTransactionsError(null);
                } catch (error) {
                    setTransactionsError(extractErrorMessage(error, "Failed to load transactions"));
                    console.error("Error fetching transactions:", error);
                } finally {
                    setTransactionsLoading(false);
                }
            };
            fetchData();
        }
    }, [user, sortOrder]);

    const getTransactionTypeColor = (type: string) => {
        switch (type) {
            case "DEPOSIT":
                return "bg-green-100 text-green-800";
            case "WITHDRAWAL":
                return "bg-red-100 text-red-800";
            case "TRANSFER":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const isTransactionDebit = (transaction: TransactionResponse): boolean => {
        if (transaction.type === "TRANSFER") {
            // For transfers, it's a debit if current user's account is the fromAccount
            const userAccountNumbers = accounts.map(a => a.accountNumber);
            return userAccountNumbers.includes(transaction.fromAccountNumber);
        }
        return transaction.type === "WITHDRAWAL";
    };

  

    const getTransactionIcon = (transaction: TransactionResponse) => {
        if (transaction.type === "TRANSFER") {
            const isDebit = isTransactionDebit(transaction);
            return isDebit ? (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16L3 12m0 0l4-4m-4 4h18" />
                </svg>
            ) : (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            );
        }

        switch (transaction.type) {
            case "DEPOSIT":
                return (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                );
            case "WITHDRAWAL":
                return (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                );
        }
    };

    const getTransactionStatusColor = (status: string) => {
        switch (status) {
            case "SUCCESS":
                return "bg-green-50 border-l-4 border-green-500";
            case "FAILED":
                return "bg-red-50 border-l-4 border-red-500";
            case "PENDING":
                return "bg-yellow-50 border-l-4 border-yellow-500";
            default:
                return "bg-gray-50 border-l-4 border-gray-500";
        }
    };

    const getTransactionDescription = (transaction: TransactionResponse): string => {
        if (transaction.type === "TRANSFER") {
            const isDebit = isTransactionDebit(transaction);
            return isDebit 
                ? `Sent to ${transaction.toAccountNumber}`
                : `Received from ${transaction.fromAccountNumber}`;
        }
        return transaction.type === "DEPOSIT"
            ? `To account ${transaction.toAccountNumber}`
            : `From account ${transaction.fromAccountNumber}`;
    };

    const getAmountColor = (transaction: TransactionResponse): string => {
        if (transaction.type === "TRANSFER") {
            return isTransactionDebit(transaction) ? "text-red-600" : "text-green-600";
        }
        return transaction.type === "DEPOSIT" ? "text-green-600" : "text-red-600";
    };

    const getAmountSign = (transaction: TransactionResponse): string => {
        if (transaction.type === "TRANSFER") {
            return isTransactionDebit(transaction) ? "-" : "+";
        }
        return transaction.type === "DEPOSIT" ? "+" : "-";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
            <Header />
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-10 text-white relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10">
                            <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#FFFFFF" d="M45.7,-76.3C58.9,-68.8,69.1,-54.6,76.5,-40.1C83.9,-25.6,88.4,-10.8,88.1,3.8C87.8,18.4,82.8,32.8,74.5,45.3C66.2,57.8,54.5,68.4,40.9,76.1C27.3,83.8,11.8,88.6,-3.4,85.6C-18.6,82.6,-33.5,71.8,-45.5,60.1C-57.5,48.4,-66.6,35.8,-73.4,21.8C-80.2,7.8,-84.6,-7.6,-81.4,-21.5C-78.2,-35.4,-67.4,-47.8,-54.6,-55.8C-41.8,-63.8,-27,-67.4,-12.3,-68.7C2.4,-70,17.1,-69,32.5,-75.1C32.5,-75.1,45.7,-76.3,45.7,-76.3Z" transform="translate(100 100)" />
                            </svg>
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Transaction History</h1>
                                <p className="text-blue-200 text-lg">View all your banking transactions</p>
                            </div>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-md"
                            >
                                ← Back to Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8">
                        {/* Sort Controls */}
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
                            <button
                                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Sort: {sortOrder === "desc" ? "Newest" : "Oldest"}
                            </button>
                        </div>

                        {/* Transactions List */}
                        {transactionsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                            </div>
                        ) : transactionsError ? (
                            <div className="bg-red-50 rounded-2xl p-8 border border-red-200 text-center">
                                <p className="text-red-700 font-semibold">{transactionsError}</p>
                            </div>
                        ) : transactions.length > 0 ? (
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                                {transactions.map((transaction, index) => (
                                    <div
                                        key={index}
                                        className={`rounded-2xl p-5 transition-all hover:shadow-lg cursor-pointer ${getTransactionStatusColor(transaction.status)}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Icon */}
                                            <div className="flex-shrink-0 p-3 bg-white rounded-full shadow-md">
                                                {getTransactionIcon(transaction)}
                                            </div>

                                            {/* Transaction Details */}
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-900">{transaction.type}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                                                        {transaction.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Ref: <span className="font-mono font-semibold text-gray-700">{transaction.transactionReference}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {getTransactionDescription(transaction)}
                                                </p>
                                                {transaction.description && (
                                                    <p className="text-sm text-gray-500 italic mt-1">{transaction.description}</p>
                                                )}
                                            </div>

                                            {/* Amount and Date */}
                                            <div className="flex-shrink-0 text-right">
                                                <div className={`text-2xl font-bold ${getAmountColor(transaction)}`}>
                                                    {getAmountSign(transaction)}${Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                                {transaction.fee && Number(transaction.fee) > 0 && (
                                                    <p className="text-xs text-orange-600 font-semibold mt-1">Fee: ${Number(transaction.fee).toFixed(2)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-16 border border-gray-200 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm text-gray-400 mb-5 border border-gray-100">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No Transactions Yet</h3>
                                <p className="text-gray-500">You haven't made any transactions. Start by creating an account and making your first transaction.</p>
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Transactions;
