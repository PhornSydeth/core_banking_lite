package com.banking.core.lite.auth.repository;

import com.banking.core.lite.auth.entity.RefreshToken;
import com.banking.core.lite.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    List<RefreshToken> findByUserAndDeviceInfo(User user, String deviceInfo);
    List<RefreshToken> findByUserId(Long id);
    Optional<RefreshToken> findByToken(String token);
    void deleteByUserId(Long userId);
    void deleteByExpiryDate(java.time.Instant now);
    Optional<RefreshToken> findByTokenAndRevokedFalse(String refreshToken);

    /**
     * Bulk-delete tokens that are expired AND revoked.
     * Keeps revoked-but-not-yet-expired rows so replay attacks can still be detected
     * within the original 7-day window.
     */
    @Modifying
    @Query("DELETE FROM RefreshToken t WHERE t.expiryDate < :now AND t.revoked = true")
    int deleteAllExpiredAndRevoked(@Param("now") Instant now);
}
