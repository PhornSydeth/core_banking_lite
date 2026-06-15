package com.banking.core.lite.transaction.entity;

import com.banking.core.lite.account.entity.Account;
import com.banking.core.lite.auth.entity.User;
import com.banking.core.lite.transaction.enumType.TransactionStatus;
import com.banking.core.lite.transaction.enumType.TransactionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "transactions",indexes = {
        @Index(name = "idx_txn_reference",columnList = "transactionReference",unique = true),
        @Index(name = "idx_idempotency_key",columnList = "idempotencyKey",unique = true)
})
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // 1. Core unique tracking reference for support/audits (e.g., TXN-20260531-XXXX)
    @Column(nullable = false, unique = true, length = 50)
    private String transactionReference;

    // 2. Safeguard against double-spending/duplicate clicks
    @Column(nullable = false, unique = true, length = 100)
    private String idempotencyKey;

    // 3. Proper entity relations to support strong relational consistency in core banking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_account_id")
    private Account fromAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_account_id")
    private Account toAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 18, scale = 4) // Prevents rounding/fractional loss
    private BigDecimal amount;

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal fee; // Track any system or network charges separately

    @Column(nullable = false, length = 3)
    private String currency; // Always explicit, transactions cannot assume account currencies match

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionStatus status;

    @Column(length = 255)
    private String description;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 4. Audit field for tracking security context (Who initiated the action)
    @Column(nullable = false, updatable = false)
    private String initiatedBy;

}
