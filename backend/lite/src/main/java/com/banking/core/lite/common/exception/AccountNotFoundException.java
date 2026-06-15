package com.banking.core.lite.common.exception;

public class AccountNotFoundException extends BankingException {
    public AccountNotFoundException(String accountNumberOrId) {
        super(404, "Account not found: " + accountNumberOrId);
    }
}
