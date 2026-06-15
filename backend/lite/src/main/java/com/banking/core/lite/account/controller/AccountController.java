package com.banking.core.lite.account.controller;

import com.banking.core.lite.account.dto.AccountRequest;
import com.banking.core.lite.account.dto.AccountResponse;
import com.banking.core.lite.account.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.security.auth.login.AccountNotFoundException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    /**
     * Creates a new account for the currently authenticated user.
     * The userId is NEVER accepted from the client body — it is resolved
     * server-side from the JWT principal to prevent IDOR attacks.
     */
    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody AccountRequest request,
            @AuthenticationPrincipal UserDetails principal) throws AccountNotFoundException {

        // principal.getUsername() returns the authenticated user's email (set in MyCustomUserDetails)
        AccountResponse response = accountService.createAccount(
                principal.getUsername(),
                request.getAccountType(),
                request.getCurrency()
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<AccountResponse> getByAccountNumber(
            @PathVariable String accountNumber) throws AccountNotFoundException {
        return ResponseEntity.ok(accountService.getByAccountNumber(accountNumber));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AccountResponse>> getAccountByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(accountService.getAccountByUserId(userId));
    }

    @PutMapping("/{accountNumber}/block")
    public ResponseEntity<Void> blockAccount(
            @PathVariable String accountNumber) throws AccountNotFoundException {
        accountService.blockAccount(accountNumber);
        return ResponseEntity.noContent().build();
    }
}

