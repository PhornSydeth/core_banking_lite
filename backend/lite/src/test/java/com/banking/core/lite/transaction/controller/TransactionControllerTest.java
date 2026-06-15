package com.banking.core.lite.transaction.controller;

import com.banking.core.lite.transaction.dto.TransactionRequest;
import com.banking.core.lite.transaction.dto.TransferRequest;
import com.banking.core.lite.transaction.service.TransactionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for {@link TransactionController} using MockMvc and Mockito.
 * These tests verify request handling, response status codes and JSON payloads
 * without touching the database.
 */
public class TransactionControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private TransactionService transactionService;

    @InjectMocks
    private TransactionController transactionController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(transactionController).build();
    }

    @Test
    void deposit_success() throws Exception {
        TransactionRequest request = new TransactionRequest("ACC-001", new BigDecimal("100.00"));
        doNothing().when(transactionService).deposit(any(String.class), any(BigDecimal.class));
        mockMvc.perform(post("/transactions/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Deposit successful"));
    }

    @Test
    void withdraw_success() throws Exception {
        TransactionRequest request = new TransactionRequest("ACC-001", new BigDecimal("50.00"));
        doNothing().when(transactionService).withdraw(any(String.class), any(BigDecimal.class));
        mockMvc.perform(post("/transactions/withdraw")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Withdraw successful"));
    }

    @Test
    void transfer_success() throws Exception {
        TransferRequest request = new TransferRequest("ACC-001", "ACC-002", new BigDecimal("25.00"));
        doNothing().when(transactionService).transfer(any(String.class), any(String.class), any(BigDecimal.class));
        mockMvc.perform(post("/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Transfer successful"));
    }

    @Test
    void getUserTransactions_success() throws Exception {
        UUID userId = UUID.randomUUID();
        when(transactionService.getUserTransactions(userId)).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/transactions/user/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void getAccountTransactions_success() throws Exception {
        String accountNumber = "ACC-001";
        when(transactionService.getAccountTransactions(accountNumber)).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/transactions/account/{accountNumber}", accountNumber))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}
