package com.banking.core.lite.auth.service;

import com.banking.core.lite.auth.repository.RefreshTokenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Nightly cleanup job for the refresh_token table.
 *
 * Strategy (production-ready):
 *  - On every token rotation: old token is marked revoked=true (row kept).
 *  - This lets us detect replay attacks within the 7-day window.
 *  - Once a revoked token is also past its expiry_date it has zero value,
 *    so this job deletes those rows in bulk every night at 02:00.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TokenCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Runs every day at 02:00 server time.
     * Cron: second minute hour day month weekday
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void purgeExpiredRevokedTokens() {
        int deleted = refreshTokenRepository.deleteAllExpiredAndRevoked(Instant.now());
        log.info("[TokenCleanup] Purged {} expired+revoked refresh token(s) from DB.", deleted);
    }
}
