package com.banking.core.lite.account.dto;

import com.banking.core.lite.account.enumtype.AccountStatus;
import com.banking.core.lite.account.enumtype.AccountType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Production-safe account response DTO.
 *
 * Intentionally excludes:
 *  - id          → internal DB UUID; exposing it enables enumeration attacks
 *  - userId      → internal DB FK; clients must never see raw primary keys
 *  - updatedDate → internal audit/versioning field; no client business value
 *
 * Uses ownerUsername as the only user-facing identity reference (masked, non-guessable).
 */
@Data
public class AccountResponse {
    // Safe public account identifier (never the internal UUID)
    private String accountNumber;

    // Identifies the owner by username, not by an internal ID
    private String ownerUsername;

    private BigDecimal balance;
    private AccountType accountType;
    private String currency;
    private AccountStatus status;

    // Only creation timestamp is meaningful to a client (read-only, non-sensitive)
    private LocalDateTime createdDate;
}
