package com.banking.core.lite.transaction.controller;

import com.banking.core.lite.transaction.dto.TransactionRequest;
import com.banking.core.lite.transaction.dto.TransactionResponse;
import com.banking.core.lite.transaction.dto.TransferRequest;
import com.banking.core.lite.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    // ================== DEPOSIT ==================
    @PostMapping("/deposit")
    public ResponseEntity<String> deposit(
            @Valid @RequestBody TransactionRequest request) {

        transactionService.deposit(
                request.accountNumber(),
                request.amount()
        );

        return ResponseEntity.ok("Deposit successful");
    }

    // ================== WITHDRAW ==================
    @PostMapping("/withdraw")
    public ResponseEntity<String> withdraw(
            @Valid @RequestBody TransactionRequest request) {

        transactionService.withdraw(
                request.accountNumber(),
                request.amount()
        );

        return ResponseEntity.ok("Withdraw successful");
    }

    // ================== TRANSFER ==================
    @PostMapping("/transfer")
    public ResponseEntity<String> transfer(
            @Valid @RequestBody TransferRequest request) {

        transactionService.transfer(
                request.fromAccount(),
                request.toAccount(),
                request.amount()
        );

        return ResponseEntity.ok("Transfer successful");
    }

    // ================== GET USER TRANSACTIONS ==================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TransactionResponse>> getUserTransactions(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(
                transactionService.getUserTransactions(userId)
        );
    }

    // ================== GET ACCOUNT TRANSACTIONS ==================
    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<List<TransactionResponse>> getAccountTransactions(
            @PathVariable String accountNumber) {

        return ResponseEntity.ok(
                transactionService.getAccountTransactions(accountNumber)
        );
    }
}
