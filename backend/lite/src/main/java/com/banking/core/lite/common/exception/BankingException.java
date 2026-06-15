package com.banking.core.lite.common.exception;

public abstract class BankingException extends RuntimeException {
    private final int errorCode;
    private final String errorMessage;
    
    public BankingException(int errorCode, String errorMessage) {
        super(errorMessage);
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    public int getErrorCode() {
        return errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
