package com.banking.core.lite.entryLedger.entity;

import com.banking.core.lite.account.entity.Account;
import com.banking.core.lite.entryLedger.enumType.EntryType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "ledger_entries")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LedgerEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false,updatable = false)
    private String refNumber;
    @Column(nullable = false, updatable = false)
    private String accountNumber;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false,updatable = false)
    private EntryType entryType;
    @Column(nullable = false,updatable = false)
    private BigDecimal amount;
    private LocalDateTime timestamp;

    public LedgerEntry(String refNumber, String accountNumber, EntryType entryType, BigDecimal amount) {
        this.refNumber = refNumber;
        this.accountNumber = accountNumber;
        this.entryType = entryType;
        this.amount = amount;
        this.timestamp=LocalDateTime.now();
    }
}

