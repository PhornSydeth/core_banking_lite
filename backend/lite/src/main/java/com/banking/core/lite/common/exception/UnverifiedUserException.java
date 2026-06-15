package com.banking.core.lite.common.exception;

public class UnverifiedUserException extends BankingException {
    public UnverifiedUserException(String status) {
        super(403, "User not verified. Status: " + status);
    }
    
    public UnverifiedUserException() {
        super(403, "User is not verified");
    }
}
