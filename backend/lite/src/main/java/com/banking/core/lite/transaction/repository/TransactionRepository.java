package com.banking.core.lite.transaction.repository;

import com.banking.core.lite.transaction.entity.Transaction;
import com.banking.core.lite.transaction.enumType.TransactionStatus;
import com.banking.core.lite.transaction.enumType.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    
    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN FETCH t.fromAccount fa " +
           "LEFT JOIN FETCH t.toAccount ta " +
           "JOIN FETCH t.user " +
           "WHERE t.user.id = :userId " +
           "OR (ta IS NOT NULL AND ta.user.id = :userId) " +
           "ORDER BY t.createdAt DESC")
    List<Transaction> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN FETCH t.fromAccount " +
           "LEFT JOIN FETCH t.toAccount " +
           "JOIN FETCH t.user " +
           "WHERE t.fromAccount.id = :accountId OR t.toAccount.id = :accountId " +
           "ORDER BY t.createdAt DESC")
    List<Transaction> findByAccountId(@Param("accountId") UUID accountId);

    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN FETCH t.fromAccount " +
           "LEFT JOIN FETCH t.toAccount " +
           "JOIN FETCH t.user " +
           "WHERE t.fromAccount.id = :accountId " +
           "ORDER BY t.createdAt DESC")
    List<Transaction> findByFromAccountId(@Param("accountId") UUID accountId);

    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN FETCH t.fromAccount " +
           "LEFT JOIN FETCH t.toAccount " +
           "JOIN FETCH t.user " +
           "WHERE t.toAccount.id = :accountId " +
           "ORDER BY t.createdAt DESC")
    List<Transaction> findByToAccountId(@Param("accountId") UUID accountId);

    List<Transaction> findByType(TransactionType type);

    List<Transaction> findByStatus(TransactionStatus status);
}
