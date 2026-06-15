package com.banking.core.lite.account.service;

import com.banking.core.lite.account.dto.AccountResponse;
import com.banking.core.lite.account.enumtype.AccountType;
import com.banking.core.lite.auth.dto.UserRegisterEvent;

import com.banking.core.lite.common.exception.AccountNotFoundException;
import java.util.List;
import java.util.UUID;

public interface AccountService {
    // authenticatedEmail is resolved from the JWT — never from the client request body
    AccountResponse createAccount(String authenticatedEmail, AccountType accountType, String currency) throws AccountNotFoundException;
    AccountResponse getByAccountNumber(String accountNumber) throws AccountNotFoundException;
    List<AccountResponse> getAccountByUserId(UUID userId);
    void blockAccount(String accountNumber) throws AccountNotFoundException;
    void onUserRegistered(UserRegisterEvent userRegisterEvent);
}

