package com.banking.core.lite.auth.dto;

import com.banking.core.lite.auth.entity.User;

import java.util.UUID;

public record UserRegisterEvent(
        UUID userId,
        String email,
        String username
) {
}
