package com.banking.core.lite.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "Email must be input")
        @Email(message = "Incorrect Email format")
        String email,
        @NotBlank(message = "OTP must be input")
        String otp,
        @NotBlank(message = "NewPassword must be input")
        String newPass

) {
}
