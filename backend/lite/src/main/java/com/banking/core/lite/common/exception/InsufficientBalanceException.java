package com.banking.core.lite.common.exception;

import java.math.BigDecimal;

public class InsufficientBalanceException extends BankingException {
    public InsufficientBalanceException(BigDecimal available, BigDecimal requested) {
        super(400, "Insufficient balance. Available: " + available + ", Requested: " + requested);
    }
    
    public InsufficientBalanceException() {
        super(400, "Insufficient balance");
    }
}
