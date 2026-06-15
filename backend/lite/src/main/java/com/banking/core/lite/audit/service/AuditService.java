package com.banking.core.lite.audit.service;

import com.banking.core.lite.audit.entity.AuditLog;
import com.banking.core.lite.audit.enumType.AuditAction;
import com.banking.core.lite.audit.enumType.AuditModule;
import com.banking.core.lite.audit.event.AuditEvent;
import com.banking.core.lite.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Central audit service that listens for {@link AuditEvent}s published by
 * the auth, account, and transaction modules and persists them as
 * immutable {@link AuditLog} records.
 *
 * <p>Events are processed asynchronously so auditing never blocks the
 * main business transaction flow.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    // ══════════════════════════════════════════════════════════
    //  Event Listener — single entry point for all audit events
    // ══════════════════════════════════════════════════════════

    /**
     * Handles every {@link AuditEvent} published anywhere in the application.
     * Runs asynchronously to avoid coupling audit persistence with the
     * originating transaction.
     */
    @Async
    @EventListener
    @Transactional
    public void onAuditEvent(AuditEvent event) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .module(event.module())
                    .action(event.action())
                    .userId(event.userId())
                    .performedBy(event.performedBy())
                    .targetEntity(event.targetEntity())
                    .targetEntityId(event.targetEntityId())
                    .details(event.details())
                    .ipAddress(event.ipAddress())
                    .deviceInfo(event.deviceInfo())
                    .success(event.success())
                    .errorMessage(event.errorMessage())
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log saved: [{}] {} by {} — {}",
                    event.module(), event.action(), event.performedBy(), event.details());
        } catch (Exception ex) {
            // Audit failures must NEVER propagate to the business layer
            log.error("Failed to persist audit log for action {} in module {}: {}",
                    event.action(), event.module(), ex.getMessage(), ex);
        }
    }

    // ══════════════════════════════════════════════════════════
    //  Query methods (for admin dashboards / compliance tools)
    // ══════════════════════════════════════════════════════════

    public List<AuditLog> getByUserId(UUID userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<AuditLog> getByModule(AuditModule module) {
        return auditLogRepository.findByModuleOrderByTimestampDesc(module);
    }

    public List<AuditLog> getByAction(AuditAction action) {
        return auditLogRepository.findByActionOrderByTimestampDesc(action);
    }

    public List<AuditLog> getByUserAndModule(UUID userId, AuditModule module) {
        return auditLogRepository.findByUserIdAndModuleOrderByTimestampDesc(userId, module);
    }

    public List<AuditLog> getByTimeRange(LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(start, end);
    }

    public List<AuditLog> getFailedActions() {
        return auditLogRepository.findBySuccessFalseOrderByTimestampDesc();
    }

    public List<AuditLog> getByTargetEntity(String targetEntity) {
        return auditLogRepository.findByTargetEntityOrderByTimestampDesc(targetEntity);
    }
}
