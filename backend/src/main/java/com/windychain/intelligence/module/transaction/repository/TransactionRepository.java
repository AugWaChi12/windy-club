package com.windychain.intelligence.module.transaction.repository;

import com.windychain.intelligence.module.transaction.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByWalletAddressOrderByBlockTimestampDesc(String walletAddress, Pageable pageable);

    List<Transaction> findByWalletAddressAndBlockTimestampBetween(
            String walletAddress, LocalDateTime start, LocalDateTime end);

    @Query("SELECT t.txType, COUNT(t) FROM Transaction t WHERE t.walletAddress = :address GROUP BY t.txType")
    List<Object[]> countByTypeForWallet(@Param("address") String address);

    boolean existsByTxHash(String txHash);

    @Query("SELECT t FROM Transaction t WHERE t.amount >= :threshold ORDER BY t.blockTimestamp DESC")
    List<Transaction> findWhaleTransactions(@Param("threshold") java.math.BigDecimal threshold, Pageable pageable);
}
