import React, { useState, useEffect } from "react";
import { AuthService } from "../service/authService.ts";
import { extractErrorMessage } from "../utils/errorHandler.ts";

interface OtpVerificationModalProps {
    isOpen: boolean;
    userEmail: string;
    onClose: () => void;
    onVerifySuccess: () => void;
}

const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
    isOpen,
    userEmail,
    onClose,
    onVerifySuccess,
}) => {
    const [email, setEmail] = useState(userEmail);
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otpCountdown, setOtpCountdown] = useState(0);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
      let timer: ReturnType<typeof setTimeout>;
        if (otpCountdown > 0) {
            timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [otpCountdown]);

    const handleSendOtp = async () => {
        if (!email) {
            setError("Please enter an email address");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            await AuthService.sendOtp(email);
            setIsOtpSent(true);
            setSuccessMessage("OTP was sent successfully to your email");
            setOtpCountdown(60);
        } catch (err: any) {
            setError(extractErrorMessage(err, "Failed to send OTP"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setError("Please enter the OTP");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await AuthService.verifyOtp(email, otp);
            setSuccessMessage("Account verified successfully!");
            setTimeout(() => {
                onVerifySuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(extractErrorMessage(err, "OTP verification failed"));
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto transform transition-all border border-gray-100">
                {/* Close Button */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Verify Account</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <p className="text-gray-600 mb-6 text-sm">
                    We'll send a verification code to your email to confirm your account.
                </p>

                {/* Email Input with Send OTP Button */}
                <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={isOtpSent}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-colors"
                        />
                        <button
                            onClick={handleSendOtp}
                            disabled={isLoading || otpCountdown > 0 || isOtpSent}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                        >
                            {otpCountdown > 0 ? `${otpCountdown}s` : "Send OTP"}
                        </button>
                    </div>
                    {successMessage && (
                        <p className="text-sm text-green-600 font-medium mt-2">✓ {successMessage}</p>
                    )}
                </div>

                {/* OTP Input */}
                {isOtpSent && (
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            OTP Code
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP from your email"
                            maxLength={6}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors tracking-widest text-center"
                        />
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && successMessage.includes("successfully") && !isOtpSent && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    {isOtpSent && (
                        <button
                            onClick={handleVerifyOtp}
                            disabled={isLoading || !otp}
                            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                        >
                            {isLoading ? "Verifying..." : "Verify Now"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OtpVerificationModal;
