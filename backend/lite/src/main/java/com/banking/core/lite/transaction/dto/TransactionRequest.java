package com.banking.core.lite.transaction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record TransactionRequest(
        @NotBlank
         String accountNumber,
         @NotNull
         @DecimalMin(value = "0.1")
         BigDecimal amount
) {
}
