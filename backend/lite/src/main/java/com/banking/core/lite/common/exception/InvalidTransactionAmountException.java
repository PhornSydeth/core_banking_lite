package com.banking.core.lite.common.exception;

import java.math.BigDecimal;

public class InvalidTransactionAmountException extends BankingException {
    public InvalidTransactionAmountException(BigDecimal amount) {
        super(400, "Invalid transaction amount: " + amount);
    }
}
