package com.banking.core.lite.audit.entity;

import com.banking.core.lite.audit.enumType.AuditAction;
import com.banking.core.lite.audit.enumType.AuditModule;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Immutable audit trail entity.
 * Every significant action across auth, account, and transaction modules
 * produces one row in the audit_logs table.
 */
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_user_id", columnList = "userId"),
        @Index(name = "idx_audit_module", columnList = "module"),
        @Index(name = "idx_audit_action", columnList = "action"),
        @Index(name = "idx_audit_timestamp", columnList = "timestamp")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The module that generated this event (AUTH, ACCOUNT, TRANSACTION). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AuditModule module;

    /** The specific action that was performed. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AuditAction action;

    /** The user who performed the action (nullable for anonymous/failed actions). */
    @Column
    private UUID userId;

    /** Human-readable identifier (email or username) for quick lookups. */
    @Column(length = 150)
    private String performedBy;

    /** The entity that was acted upon (account number, transaction reference, etc.). */
    @Column(length = 255)
    private String targetEntity;

    /** The ID of the target entity (account ID, transaction ID, etc.). */
    @Column(length = 100)
    private String targetEntityId;

    /** Free-form details about the action (e.g., "Deposited 500.00 USD"). */
    @Column(length = 500)
    private String details;

    /** Client IP address for security tracking. */
    @Column(length = 45)
    private String ipAddress;

    /** User-Agent / device information. */
    @Column(length = 255)
    private String deviceInfo;

    /** Whether the action succeeded or failed. */
    @Column(nullable = false)
    private boolean success;

    /** Error message if the action failed. */
    @Column(length = 500)
    private String errorMessage;

    /** Timestamp of the event — set once, never updated. */
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
