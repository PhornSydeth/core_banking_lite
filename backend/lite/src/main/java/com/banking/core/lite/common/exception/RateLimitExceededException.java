package com.banking.core.lite.common.exception;

public class RateLimitExceededException extends BankingException {
    public RateLimitExceededException(long remainingSeconds) {
        super(429, "Too many attempts. Try again in " + remainingSeconds + " seconds");
    }
    
    public RateLimitExceededException(String message) {
        super(429, message);
    }
}
