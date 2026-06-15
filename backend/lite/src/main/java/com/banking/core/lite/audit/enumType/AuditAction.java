package com.banking.core.lite.audit.enumType;

/**
 * Enumerates every auditable action across all banking modules.
 */
public enum AuditAction {

    // ── Auth Module ──────────────────────────────────────────
    USER_REGISTER,
    USER_LOGIN,
    USER_LOGIN_FAILED,
    USER_LOGOUT,
    TOKEN_REFRESH,
    OTP_SENT,
    OTP_VERIFIED,
    PASSWORD_CHANGED,

    // ── Account Module ───────────────────────────────────────
    ACCOUNT_CREATED,
    ACCOUNT_BLOCKED,
    ACCOUNT_VIEWED,

    // ── Transaction Module ───────────────────────────────────
    DEPOSIT,
    WITHDRAWAL,
    TRANSFER
}
