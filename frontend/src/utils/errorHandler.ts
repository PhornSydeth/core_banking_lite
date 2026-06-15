import {type ApiResponse } from "../types/ApiResponse";

export const extractErrorMessage = (error: any, defaultMessage: string = "An unexpected error occurred"): string => {
    // If it's already a string, return it directly
    if (typeof error === "string") {
        return error;
    }

    // Check if it's our structured ApiResponse
    if (error && typeof error === "object") {
        const apiResponse = error as ApiResponse;
        
        // If it has field errors, format them beautifully
        if (apiResponse.fieldErrors && apiResponse.fieldErrors.length > 0) {
            const fieldErrorStrings = apiResponse.fieldErrors.map(fe => `${fe.field}: ${fe.message}`);
            return `${apiResponse.message} - ${fieldErrorStrings.join(", ")}`;
        }

        // If it has a standard message from our backend
        if (apiResponse.message) {
            return apiResponse.message;
        }

        // Fallback to standard Error object message if present
        if (error.message) {
            return error.message;
        }
    }

    return defaultMessage;
};
