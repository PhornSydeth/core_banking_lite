package com.banking.core.lite.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


public record PassChangeReq(
        @NotBlank(message = "Email must not be null")@Email(message = "Invalid email format") String email,
        @NotBlank(message = "OTP must not be null") String OTP,
        @NotBlank(message = "NewPassword must not be null") String newPass
) {
}
