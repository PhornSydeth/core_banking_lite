package com.banking.core.lite.transaction.service;

import com.banking.core.lite.account.entity.Account;
import com.banking.core.lite.audit.enumType.AuditAction;
import com.banking.core.lite.audit.enumType.AuditModule;
import com.banking.core.lite.audit.event.AuditEvent;
import com.banking.core.lite.account.enumtype.AccountStatus;
import com.banking.core.lite.account.repository.AccountRepository;
import com.banking.core.lite.auth.entity.User;
import com.banking.core.lite.entryLedger.entity.LedgerEntry;
import com.banking.core.lite.entryLedger.enumType.EntryType;
import com.banking.core.lite.entryLedger.repository.LedgerRepo;
import com.banking.core.lite.transaction.dto.TransactionResponse;
import com.banking.core.lite.transaction.entity.Transaction;
import com.banking.core.lite.transaction.enumType.TransactionStatus;
import com.banking.core.lite.transaction.enumType.TransactionType;
import com.banking.core.lite.transaction.repository.TransactionRepository;
import com.banking.core.lite.common.exception.AccountNotFoundException;
import com.banking.core.lite.common.exception.InsufficientBalanceException;
import com.banking.core.lite.common.exception.InvalidTransactionAmountException;
import com.banking.core.lite.common.exception.UnverifiedUserException;
import com.banking.core.lite.common.exception.ValidationException;
import com.banking.core.lite.transaction.utils.TransactionRefGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final ApplicationEventPublisher publisher;
    private final LedgerRepo ledgerRepo;
    private final String shareRef=TransactionRefGenerator.generateTransactionReference();
    private Account getAccountForUpdate(String accountNumber) {
        return accountRepository.findByAccountNumberForUpdate(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));
    }

    @Transactional
    @Override
    public void deposit(String accountNumber, BigDecimal amount) {
        validateAmount(amount);
        Account account = getAccountForUpdate(accountNumber);
        validateUserVerified(account.getUser());
        validateAccountStatus(account);
        account.setBalance(account.getBalance().add(amount));
        String txtRef=TransactionRefGenerator.generateTransactionReference();
        LedgerEntry credit=new LedgerEntry(txtRef,account.getAccountNumber(),EntryType.CREDIT,amount);
        ledgerRepo.save(credit);
        transactionRepository.save(
                buildTransaction(account.getUser(),txtRef, null, account, amount, TransactionType.DEPOSIT, account.getCurrency())
        );
        transactionRepository.flush();

        // ── Audit: DEPOSIT ─────────────────────────────────────────────────
        publisher.publishEvent(AuditEvent.builder()
                .module(AuditModule.TRANSACTION)
                .action(AuditAction.DEPOSIT)
                .userId(account.getUser().getId())
                .performedBy(getAuthenticatedEmail())
                .targetEntity("Account")
                .targetEntityId(accountNumber)
                .details("Deposited " + amount + " " + account.getCurrency() + " into " + accountNumber)
                .success(true)
                .build());
    }

    @Transactional
    @Override
    public void withdraw(String accountNumber, BigDecimal amount) {
        validateAmount(amount);
        Account account = getAccountForUpdate(accountNumber);
        validateUserVerified(account.getUser());
        validateAccountStatus(account);

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException();
        }

        account.setBalance(account.getBalance().subtract(amount));
        String txtRef=TransactionRefGenerator.generateTransactionReference();
        LedgerEntry debit=new LedgerEntry(txtRef,accountNumber,EntryType.DEBIT,amount);
        ledgerRepo.save(debit);
        transactionRepository.save(
                buildTransaction(account.getUser(),txtRef, account, null, amount, TransactionType.WITHDRAW, account.getCurrency())
        );
        transactionRepository.flush();

        // ── Audit: WITHDRAWAL ──────────────────────────────────────────────
        publisher.publishEvent(AuditEvent.builder()
                .module(AuditModule.TRANSACTION)
                .action(AuditAction.WITHDRAWAL)
                .userId(account.getUser().getId())
                .performedBy(getAuthenticatedEmail())
                .targetEntity("Account")
                .targetEntityId(accountNumber)
                .details("Withdrew " + amount + " " + account.getCurrency() + " from " + accountNumber)
                .success(true)
                .build());
    }

    @Transactional
    @Override
    public void transfer(String fromAccount, String toAccount, BigDecimal amount) {
        if (fromAccount.equals(toAccount)) {
            throw new ValidationException("Cannot transfer to same account");
        }

        validateAmount(amount);

        // 🔥 CRITICAL DEADLOCK AVOIDANCE: lock accounts in a consistent lexicographical order
        Account from;
        Account to;
        if (fromAccount.compareTo(toAccount) < 0) {
            from = getAccountForUpdate(fromAccount);
            to = getAccountForUpdate(toAccount);
        } else {
            to = getAccountForUpdate(toAccount);
            from = getAccountForUpdate(fromAccount);
        }

        validateUserVerified(from.getUser());
        validateUserVerified(to.getUser());
        validateAccountStatus(from);
        validateAccountStatus(to);

        // Core banking check: currencies must match for peer-to-peer transfers
        if (!from.getCurrency().equalsIgnoreCase(to.getCurrency())) {
            throw new ValidationException("Currency mismatch: " + from.getCurrency() + " vs " + to.getCurrency());
        }

        if (from.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException();
        }

        // Atomic balance update
        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));
        String txtRef=TransactionRefGenerator.generateTransactionReference();

        transactionRepository.save(
                buildTransaction(from.getUser(),txtRef, from, to, amount, TransactionType.TRANSFER, from.getCurrency())
        );

        LedgerEntry credit=new LedgerEntry(txtRef,from.getAccountNumber(), EntryType.DEBIT,amount);
        LedgerEntry debit=new LedgerEntry(txtRef,to.getAccountNumber(),EntryType.CREDIT,amount);
        ledgerRepo.saveAll(List.of(credit,debit));
        transactionRepository.flush();

        // ── Audit: TRANSFER ────────────────────────────────────────────────
        publisher.publishEvent(AuditEvent.builder()
                .module(AuditModule.TRANSACTION)
                .action(AuditAction.TRANSFER)
                .userId(from.getUser().getId())
                .performedBy(getAuthenticatedEmail())
                .targetEntity("Account")
                .targetEntityId(fromAccount + " -> " + toAccount)
                .details("Transferred " + amount + " " + from.getCurrency() + " from " + fromAccount + " to " + toAccount)
                .success(true)
                .build());
    }

    @Transactional
    @Override
    public List<TransactionResponse> getUserTransactions(UUID userId) {
        return transactionRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public List<TransactionResponse> getAccountTransactions(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));
        // Fetch BOTH incoming and outgoing transactions for complete balanced ledger history
        return transactionRepository.findByAccountId(account.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransactionAmountException(amount);
        }
    }

    private void validateAccountStatus(Account account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new ValidationException("Account is not active");
        }
    }

    private void validateUserVerified(User user) {
        // Use security context if user not provided (e.g., system actions)
        if (user == null) {
            user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        }
        assert user != null;
        if (!user.isVerified()) {
            throw new UnverifiedUserException();
        }
    }

    private Transaction buildTransaction(User user,
                                         String txtRef,
                                         Account from,
                                         Account to,
                                         BigDecimal amount,
                                         TransactionType type,
                                         String currency) {
        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setFromAccount(from);
        tx.setToAccount(to);
        tx.setAmount(amount);
        tx.setFee(BigDecimal.ZERO); // default fee for simple banking
        tx.setCurrency(currency);
        tx.setType(type);
        tx.setStatus(TransactionStatus.SUCCESS);
        tx.setTransactionReference(txtRef);
        tx.setIdempotencyKey(UUID.randomUUID().toString());

        // Audit tracking for security context (Who initiated the transaction)
        String initiatedBy = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "SYSTEM";
        tx.setInitiatedBy(initiatedBy);
        tx.setCreatedAt(LocalDateTime.now());

        return tx;
    }



    private TransactionResponse mapToResponse(Transaction tx) {
        return new TransactionResponse(
                tx.getId(),
                tx.getTransactionReference(),
                tx.getIdempotencyKey(),
                tx.getFromAccount() != null ? tx.getFromAccount().getAccountNumber() : null,
                tx.getToAccount() != null ? tx.getToAccount().getAccountNumber() : null,
                tx.getAmount(),
                tx.getFee(),
                tx.getCurrency(),
                tx.getType(),
                tx.getStatus(),
                tx.getDescription(),
                tx.getCreatedAt(),
                tx.getInitiatedBy()
        );
    }

    private String getAuthenticatedEmail() {
        return SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "SYSTEM";
    }
}
