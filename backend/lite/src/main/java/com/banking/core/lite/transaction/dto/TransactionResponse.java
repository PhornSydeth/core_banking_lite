package com.banking.core.lite.transaction.dto;

import com.banking.core.lite.transaction.enumType.TransactionStatus;
import com.banking.core.lite.transaction.enumType.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        String transactionReference,
        String idempotencyKey,
        String fromAccountNumber,
        String toAccountNumber,
        BigDecimal amount,
        BigDecimal fee,
        String currency,
        TransactionType type,
        TransactionStatus status,
        String description,
        LocalDateTime createdAt,
        String initiatedBy
) {
}
