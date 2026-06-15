package com.banking.core.lite.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Email must be input")
    @Email(message = "Invalidate Email")
    String email,
    String password
) {
}
