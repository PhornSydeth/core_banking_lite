package com.banking.core.lite.auth.dto;

import lombok.Builder;

@Builder
public record AuthTokens(String accessToken, String refreshToken) {
}
