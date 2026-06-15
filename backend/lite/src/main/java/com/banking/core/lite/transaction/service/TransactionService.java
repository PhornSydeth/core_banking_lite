package com.banking.core.lite.transaction.service;

import com.banking.core.lite.transaction.dto.TransactionResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
@Component
public interface TransactionService {
    // Deposit money into account
    void deposit(String accountNumber, BigDecimal amount);

    // Withdraw money from account
    void withdraw(String accountNumber, BigDecimal amount);

    // Transfer between accounts
    void transfer(String fromAccount, String toAccount, BigDecimal amount);

    // Get transaction history
    List<TransactionResponse> getUserTransactions(UUID userId);

    List<TransactionResponse> getAccountTransactions(String accountNumber);
}
