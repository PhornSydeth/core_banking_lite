import React, { useState } from "react";
import { AuthService } from "../service/authService";

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [accountNumber, setAccountNumber] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleDeposit = async () => {
        if (!accountNumber) {
            setError("Please enter an account number.");
            return;
        }
        if (!amount || Number(amount) <= 0) {
            setError("Please enter a valid amount.");
            return;
        }
        
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        
        try {
            const isAccountExist = await AuthService.getAccountByNumber(accountNumber);
            if (!isAccountExist) {
                setError("Account does not exist.");
                setLoading(false);
                return;
            }
            await AuthService.deposit(accountNumber, Number(amount));
            setSuccessMessage("Deposit successful!");
            setTimeout(() => {
                onSuccess();
            }, 1500); // give it a moment to show success message
        } catch (err: any) {
            setError(err || "Failed to deposit funds.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
                <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="text-xl font-bold">Deposit Funds</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                            {successMessage}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
                            <input 
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                placeholder="Enter account number"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
                            <input 
                                type="number"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleDeposit}
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-colors shadow-md hover:shadow-lg flex justify-center items-center"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : "Deposit Now"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepositModal;