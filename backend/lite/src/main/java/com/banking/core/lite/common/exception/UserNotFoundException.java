package com.banking.core.lite.common.exception;

public class UserNotFoundException extends BankingException {
    public UserNotFoundException(String identifier) {
        super(404, "User not found: " + identifier);
    }
    
    public UserNotFoundException() {
        super(404, "User not found");
    }
}
