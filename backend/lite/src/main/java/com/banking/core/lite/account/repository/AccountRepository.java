package com.banking.core.lite.account.repository;

import com.banking.core.lite.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {
    // 1. Used by getByAccountNumber() to pull account and user data in exactly ONE database call
    @Query("SELECT a FROM Account a JOIN FETCH a.user WHERE a.accountNumber = :accountNumber")
    Optional<Account> findByAccountNumberWithUser(@Param("accountNumber") String accountNumber);

    // 2. Used by getAccountByUserId() to avoid the N+1 trap when returning a list of user accounts
    @Query("SELECT a FROM Account a JOIN FETCH a.user WHERE a.user.id = :userId")
    List<Account> findByUserIdWithUser(@Param("userId") UUID userId);

    // 3. Keep a standard, lightweight look up for methods like blockAccount() where you don't need User details
    Optional<Account> findByAccountNumber(String accountNumber);

    // 4. Concurrency-safe pessimistic write lock lookup with user fetch
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a JOIN FETCH a.user WHERE a.accountNumber = :accountNumber")
    Optional<Account> findByAccountNumberForUpdate(@Param("accountNumber") String accountNumber);

}
