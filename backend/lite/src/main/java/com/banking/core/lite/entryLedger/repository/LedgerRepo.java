package com.banking.core.lite.entryLedger.repository;

import com.banking.core.lite.entryLedger.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LedgerRepo extends JpaRepository<LedgerEntry,Long> {
}
