package com.banking.core.lite.audit.repository;

import com.banking.core.lite.audit.entity.AuditLog;
import com.banking.core.lite.audit.enumType.AuditAction;
import com.banking.core.lite.audit.enumType.AuditModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    /** All audit entries for a specific user, most recent first. */
    List<AuditLog> findByUserIdOrderByTimestampDesc(UUID userId);

    /** All audit entries for a given module. */
    List<AuditLog> findByModuleOrderByTimestampDesc(AuditModule module);

    /** All audit entries for a specific action type. */
    List<AuditLog> findByActionOrderByTimestampDesc(AuditAction action);

    /** All audit entries for a specific user within a module. */
    List<AuditLog> findByUserIdAndModuleOrderByTimestampDesc(UUID userId, AuditModule module);

    /** Entries within a time range — useful for compliance reports. */
    List<AuditLog> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);

    /** Failed actions — useful for detecting attacks or anomalies. */
    List<AuditLog> findBySuccessFalseOrderByTimestampDesc();

    /** All entries related to a specific target entity (e.g., account number). */
    List<AuditLog> findByTargetEntityOrderByTimestampDesc(String targetEntity);
}
