package com.banking.core.lite.account.service;

import com.banking.core.lite.account.dto.AccountResponse;
import com.banking.core.lite.account.entity.Account;
import com.banking.core.lite.audit.enumType.AuditAction;
import com.banking.core.lite.audit.enumType.AuditModule;
import com.banking.core.lite.audit.event.AuditEvent;
import com.banking.core.lite.account.enumtype.AccountStatus;
import com.banking.core.lite.account.enumtype.AccountType;
import com.banking.core.lite.account.repository.AccountRepository;
import com.banking.core.lite.auth.dto.UserRegisterEvent;
import com.banking.core.lite.auth.entity.User;
import com.banking.core.lite.auth.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import com.banking.core.lite.common.exception.AccountNotFoundException;
import com.banking.core.lite.common.exception.UserNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher publisher;

    @Override
    @Transactional
    public AccountResponse createAccount(String authenticatedEmail, AccountType accountType, String currency) throws AccountNotFoundException {
        // Resolve the user from the JWT email — client NEVER supplies the userId
        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new UserNotFoundException(authenticatedEmail));

        Account account = new Account();
        account.setUser(user);
        account.setAccountNumber(generateAccountNumber());
        account.setBalance(BigDecimal.ZERO);
        account.setAccountType(accountType);
        account.setCurrency(currency.toUpperCase());
        account.setStatus(AccountStatus.ACTIVE);
        Account savedAccount = accountRepository.save(account);

        // ── Audit: ACCOUNT_CREATED ──────────────────────────────────────────
        publisher.publishEvent(AuditEvent.builder()
                .module(AuditModule.ACCOUNT)
                .action(AuditAction.ACCOUNT_CREATED)
                .userId(user.getId())
                .performedBy(authenticatedEmail)
                .targetEntity("Account")
                .targetEntityId(savedAccount.getAccountNumber())
                .details("Account created: " + accountType + " (" + currency.toUpperCase() + ")")
                .success(true)
                .build());

        return mapToResponse(savedAccount);
    }

    @Override
    @Transactional
    public AccountResponse getByAccountNumber(String accountNumber) throws AccountNotFoundException {
        // Use a customized query that pre-fetches the user proxy safely
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        return mapToResponse(account);
    }

    @Override
    @Transactional
    public List<AccountResponse> getAccountByUserId(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId.toString());
        }
        // Custom repository method executing a 'JOIN FETCH' to solve the N+1 problem
        return accountRepository.findByUserIdWithUser(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }



    @Override
    @Transactional // Crucial tracking annotation fixed here
    public void blockAccount(String accountNumber) throws AccountNotFoundException {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        account.setStatus(AccountStatus.BLOCKED);
        accountRepository.save(account);

        // ── Audit: ACCOUNT_BLOCKED ──────────────────────────────────────────
        publisher.publishEvent(AuditEvent.builder()
                .module(AuditModule.ACCOUNT)
                .action(AuditAction.ACCOUNT_BLOCKED)
                .userId(account.getUser().getId())
                .performedBy(account.getUser().getEmail())
                .targetEntity("Account")
                .targetEntityId(accountNumber)
                .details("Account blocked: " + accountNumber)
                .success(true)
                .build());
    }

    @EventListener
    @Transactional // Executes seamlessly within the onboarding event transaction chain
    @Override
    public void onUserRegistered(UserRegisterEvent userRegisterEvent) {
        Account account = new Account();
        User userProxy = userRepository.getReferenceById(userRegisterEvent.userId());
        account.setUser(userProxy);
        account.setAccountNumber(generateAccountNumber());
        account.setAccountType(AccountType.SAVINGS);
        account.setBalance(BigDecimal.ZERO);
        account.setCurrency("USD");
        account.setStatus(AccountStatus.ACTIVE);
        Account savedAccount = accountRepository.save(account);

        // ── Audit: ACCOUNT_CREATED (auto on register) ───────────────────────
        publisher.publishEvent(AuditEvent.builder()
                .module(AuditModule.ACCOUNT)
                .action(AuditAction.ACCOUNT_CREATED)
                .userId(userRegisterEvent.userId())
                .performedBy(userRegisterEvent.email())
                .targetEntity("Account")
                .targetEntityId(savedAccount.getAccountNumber())
                .details("Default SAVINGS account auto-created on registration")
                .success(true)
                .build());
    }

    /**
     * Fixes the production infinite loop bug.
     * Uses a combination of timestamp metrics and system sequences
     * instead of relying strictly on random while-loops.
     */
    private String generateAccountNumber() {
        long timestampFragment = System.currentTimeMillis() % 100_0000L; // 6 digits
        long randomFragment = ThreadLocalRandom.current().nextLong(100_000L, 100_0000L); // 6 digits
        return String.format("%06d%06d", timestampFragment, randomFragment);
    }

    private AccountResponse mapToResponse(Account account) {
        AccountResponse response = new AccountResponse();

        // Public identifier — safe to expose (no internal UUID or user FK)
        response.setAccountNumber(account.getAccountNumber());

        // Exposes the username (not the internal userId) as the owner identity
        response.setOwnerUsername(account.getUser().getUsername());

        response.setBalance(account.getBalance());
        response.setAccountType(account.getAccountType());
        response.setCurrency(account.getCurrency());
        response.setStatus(account.getStatus());

        // Only creation date is client-relevant (read-only, non-sensitive)
        response.setCreatedDate(account.getCreatedDate());

        return response;
    }
}
