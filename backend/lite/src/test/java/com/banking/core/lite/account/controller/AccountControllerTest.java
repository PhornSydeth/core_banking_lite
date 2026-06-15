package com.banking.core.lite.account.controller;

import com.banking.core.lite.account.dto.AccountRequest;
import com.banking.core.lite.account.dto.AccountResponse;
import com.banking.core.lite.account.enumtype.AccountType;
import com.banking.core.lite.account.service.AccountService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for {@link AccountController} using MockMvc and Mockito.
 */
public class AccountControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AccountService accountService;

    @InjectMocks
    private AccountController accountController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(accountController).build();
    }

    @Test
    void createAccount_success() throws Exception {
        AccountRequest request = new AccountRequest(UUID.randomUUID(), AccountType.SAVINGS, "USD");
        AccountResponse response = new AccountResponse(); // assuming a default constructor exists
        when(accountService.createAccount(String.valueOf(ArgumentMatchers.any(UUID.class)), AccountType.valueOf(ArgumentMatchers.any(String.class)), any(String.class))).thenReturn(response);
        mockMvc.perform(post("/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void getByAccountNumber_success() throws Exception {
        String accountNumber = "ACC-001";
        AccountResponse response = new AccountResponse();
        when(accountService.getByAccountNumber(accountNumber)).thenReturn(response);
        mockMvc.perform(get("/accounts/{accountNumber}", accountNumber))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void getAccountByUserId_success() throws Exception {
        UUID userId = UUID.randomUUID();
        when(accountService.getAccountByUserId(userId)).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/accounts/user/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void blockAccount_success() throws Exception {
        String accountNumber = "ACC-001";
        doNothing().when(accountService).blockAccount(accountNumber);
        mockMvc.perform(put("/accounts/{accountNumber}/block", accountNumber))
                .andExpect(status().isNoContent());
    }
}
