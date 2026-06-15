package com.banking.core.lite.common.exception;

public class ValidationException extends BankingException {
    public ValidationException(String message) {
        super(400, message);
    }
}
