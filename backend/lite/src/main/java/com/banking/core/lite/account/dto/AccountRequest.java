package com.banking.core.lite.account.dto;

import com.banking.core.lite.account.enumtype.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Account creation request DTO.
 *
 * Intentionally does NOT include userId — the owner identity is always
 * resolved server-side from the authenticated JWT to prevent IDOR attacks.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountRequest {

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be a valid 3-letter ISO code (e.g. USD)")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be uppercase ISO-4217 format")
    private String currency;

    public AccountRequest(UUID uuid, AccountType accountType, String usd) {
    }
}
