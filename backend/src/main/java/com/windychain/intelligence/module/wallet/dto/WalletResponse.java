package com.windychain.intelligence.module.wallet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse {
    private String address;
    private String label;
    private String behaviorType;
    private BigDecimal balanceKub;
    private BigDecimal balanceUsd;
    private int totalTransactions;
    private LocalDateTime firstSeenAt;
}
