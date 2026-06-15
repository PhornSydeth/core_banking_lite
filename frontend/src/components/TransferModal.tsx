import React, { useState } from "react";
import { AuthService } from "../service/authService.ts";
import { extractErrorMessage } from "../utils/errorHandler.ts";

interface TransferModalProps {
    isOpen: boolean;
    accountNumber: string;
    onClose: () => void;
    onSuccess: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, accountNumber, onClose, onSuccess }) => {
    const [receiverAccount, setReceiverAccount] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleReset = () => {
        setReceiverAccount("");
        setAmount("");
        setError(null);
        setSuccess(false);
        setIsLoading(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const validateInput = (): boolean => {
        setError(null);

        // Check if receiver account is empty
        if (!receiverAccount.trim()) {
            setError("Receiver account number is required");
            return false;
        }

        // Check if amount is empty
        if (!amount.trim()) {
            setError("Amount is required");
            return false;
        }

        const numAmount = parseFloat(amount);

        // Check if amount is a valid number
        if (isNaN(numAmount)) {
            setError("Amount must be a valid number");
            return false;
        }

        // Check if amount is less than 0.1
        if (numAmount < 0.1) {
            setError("Amount must be at least $0.10");
            return false;
        }

        // Check if amount is negative (redundant but explicit)
        if (numAmount <= 0) {
            setError("Amount must be greater than $0");
            return false;
        }

        // Check if same account
        if (receiverAccount.trim() === accountNumber) {
            setError("Cannot transfer to the same account");
            return false;
        }

        return true;
    };

    const handleTransfer = async () => {
        if (!validateInput()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await AuthService.transfer(accountNumber, receiverAccount.trim(), parseFloat(amount));
            setSuccess(true);
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err, "Transfer failed");
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-6 text-white">
                    <h2 className="text-2xl font-bold">Transfer Money</h2>
                    <p className="text-blue-200 text-sm mt-1">From: <span className="font-mono font-semibold">{accountNumber}</span></p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {success ? (
                        // Success State
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Transfer Successful!</h3>
                            <p className="text-gray-600 mb-2">
                                ${parseFloat(amount).toFixed(2)} transferred to
                            </p>
                            <p className="font-mono font-semibold text-gray-800 mb-6">{receiverAccount}</p>
                            <button
                                onClick={() => {
                                    handleClose();
                                    onSuccess();
                                }}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        // Form State
                        <>
                            {/* Receiver Account Input */}
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Receiver Account Number
                                </label>
                                <input
                                    type="text"
                                    value={receiverAccount}
                                    onChange={(e) => {
                                        setReceiverAccount(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="Enter account number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Amount Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Amount (USD)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setError(null);
                                        }}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm font-semibold">{error}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTransfer}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Transferring...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                            </svg>
                                            Transfer
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransferModal;
