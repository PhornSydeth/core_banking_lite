package com.banking.core.lite.audit.event;

import com.banking.core.lite.audit.enumType.AuditAction;
import com.banking.core.lite.audit.enumType.AuditModule;
import lombok.Builder;

import java.util.UUID;

/**
 * Lightweight event published via {@link org.springframework.context.ApplicationEventPublisher}.
 * The audit service listens for these and persists them to the audit_logs table.
 */
@Builder
public record AuditEvent(
        AuditModule module,
        AuditAction action,
        UUID userId,
        String performedBy,
        String targetEntity,
        String targetEntityId,
        String details,
        String ipAddress,
        String deviceInfo,
        boolean success,
        String errorMessage
) {
}
