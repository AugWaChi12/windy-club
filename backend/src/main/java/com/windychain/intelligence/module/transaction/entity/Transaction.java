package com.windychain.intelligence.module.transaction.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "wallet_address", nullable = false, length = 42)
    private String walletAddress;

    @Column(name = "tx_hash", nullable = false, unique = true, length = 66)
    private String txHash;

    @Column(name = "block_number", nullable = false)
    private Long blockNumber;

    @Column(name = "tx_type", nullable = false, length = 20)
    @Builder.Default
    private String txType = "transfer";

    @Column(name = "from_address", nullable = false, length = 42)
    private String fromAddress;

    @Column(name = "to_address", length = 42)
    private String toAddress;

    @Column(nullable = false, precision = 38, scale = 18)
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "token_address", length = 42)
    private String tokenAddress;

    @Column(name = "token_symbol", length = 20)
    @Builder.Default
    private String tokenSymbol = "KUB";

    @Column(name = "gas_used", precision = 38, scale = 18)
    private BigDecimal gasUsed;

    @Column(name = "gas_price", precision = 38, scale = 18)
    private BigDecimal gasPrice;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String status = "success";

    @Column(name = "block_timestamp", nullable = false)
    private LocalDateTime blockTimestamp;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
