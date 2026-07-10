import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.tsx";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import TransferModal from "../components/TransferModal.tsx";
import DepositModal from "../components/DepositModal.tsx";
import { AuthService, type AccountResponse } from "../service/authService.ts";
import { extractErrorMessage } from "../utils/errorHandler.ts";

const Dashboard: React.FC = () => {
    // @ts-ignore
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<AccountResponse[]>([]);
    const [accountsLoading, setAccountsLoading] = useState(false);
    const [accountsError, setAccountsError] = useState<string | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

    useEffect(() => {
        if (user && user.userId) {
            const fetchAccounts = async () => {
                setAccountsLoading(true);
                try {
                    const data = await AuthService.getAccountsByUserId(user.userId);
                    setAccounts(data);
                    setAccountsError(null);
                } catch (error) {
                    setAccountsError(extractErrorMessage(error, "Failed to load accounts"));
                    console.error("Error fetching accounts:", error);
                }
                finally {
                    setAccountsLoading(false);
                }
            };
            fetchAccounts();
        }
    }, [user]);

    const getTotalBalance = (): number => {
        return accounts.reduce((sum, account) => sum + Number(account.balance), 0);
    };

    const getActiveAccountsCount = (): number => {
        return accounts.filter(account => account.status === "ACTIVE").length;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
    );

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
            <Header />
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Dashboard Header Banner */}
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-10 text-white relative overflow-hidden">
                        {/* Decorative background vectors */}
                        <div className="absolute right-0 top-0 opacity-10">
                            <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#FFFFFF" d="M45.7,-76.3C58.9,-68.8,69.1,-54.6,76.5,-40.1C83.9,-25.6,88.4,-10.8,88.1,3.8C87.8,18.4,82.8,32.8,74.5,45.3C66.2,57.8,54.5,68.4,40.9,76.1C27.3,83.8,11.8,88.6,-3.4,85.6C-18.6,82.6,-33.5,71.8,-45.5,60.1C-57.5,48.4,-66.6,35.8,-73.4,21.8C-80.2,7.8,-84.6,-7.6,-81.4,-21.5C-78.2,-35.4,-67.4,-47.8,-54.6,-55.8C-41.8,-63.8,-27,-67.4,-12.3,-68.7C2.4,-70,17.1,-69,32.5,-75.1C32.5,-75.1,45.7,-76.3,45.7,-76.3Z" transform="translate(100 100)" />
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Welcome back, {user.username}!</h1>
                            <p className="text-blue-200 text-lg">Here's an overview of your CoreBanking Lite account.</p>
                        </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Card 1 */}
                            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-blue-800 font-semibold mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Total Balance
                                </h3>
                                <p className="text-3xl font-bold text-blue-900">
                                    ${getTotalBalance().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            {/* Card 2 */}
                            <div className="bg-green-50 rounded-2xl p-6 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-green-800 font-semibold mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    Active Accounts
                                </h3>
                                <p className="text-3xl font-bold text-green-900">{getActiveAccountsCount()}</p>
                            </div>
                            {/* Card 3 */}
                            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-purple-800 font-semibold mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                    Total Accounts
                                </h3>
                                <p className="text-3xl font-bold text-purple-900">{accounts.length}</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mb-8 flex gap-4 flex-wrap">
                            <button
                                onClick={() => navigate("/transactions")}
                                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                View Transactions
                            </button>
                            <button 
                                onClick={() => setIsDepositModalOpen(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Deposit Funds
                            </button>
                        </div>
                        {/* Accounts List Section */}
                        {accountsLoading ? (
                            <div className="bg-gray-50 rounded-2xl p-10 border border-gray-200 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                            </div>
                        ) : accountsError ? (
                            <div className="bg-red-50 rounded-2xl p-8 border border-red-200 text-center">
                                <p className="text-red-700 font-semibold">{accountsError}</p>
                            </div>
                        ) : accounts.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Account Number</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Currency</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Balance</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {accounts.map((account, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{account.accountNumber}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                            {account.accountType}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{account.currency}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                        ${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${account.status === 'ACTIVE'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {account.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {new Date(account.createdDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAccount(account.accountNumber);
                                                                setIsTransferModalOpen(true);
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                                                            disabled={account.status !== 'ACTIVE'}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                            </svg>
                                                            Transfer
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-10 border border-gray-200 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm text-gray-400 mb-5 border border-gray-100">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No Accounts Yet</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-8">You don't have any banking accounts. Open a new banking account to start managing your funds.</p>
                                <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5">
                                    Open New Account
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Deposit Modal */}
                <DepositModal
                    isOpen={isDepositModalOpen}
                    onClose={() => setIsDepositModalOpen(false)}
                    onSuccess={() => {
                        setIsDepositModalOpen(false);
                        // Refresh accounts after successful deposit
                        if (user && user.userId) {
                            const fetchAccounts = async () => {
                                try {
                                    const data = await AuthService.getAccountsByUserId(user.userId);
                                    setAccounts(data);
                                } catch (error) {
                                    console.error("Error refreshing accounts:", extractErrorMessage(error));
                                }
                            };
                            fetchAccounts();
                        }
                    }}
                />

                {/* Transfer Modal */}
                {selectedAccount && (
                    <TransferModal
                        isOpen={isTransferModalOpen}
                        accountNumber={selectedAccount}
                        onClose={() => {
                            setIsTransferModalOpen(false);
                            setSelectedAccount(null);
                        }}
                        onSuccess={() => {
                            setIsTransferModalOpen(false);
                            setSelectedAccount(null);
                            // Refresh accounts after successful transfer
                            if (user && user.userId) {
                                const fetchAccounts = async () => {
                                    try {
                                        const data = await AuthService.getAccountsByUserId(user.userId);
                                        setAccounts(data);
                                    } catch (error) {
                                        console.error("Error refreshing accounts:", extractErrorMessage(error));
                                    }
                                };
                                fetchAccounts();
                            }
                        }}
                    />
                )}
            </main>
            <Footer />
        </div>
    )
}
export default Dashboard;