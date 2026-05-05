package com.windychain.intelligence.module.pnl.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PnlResponse {
    private String walletAddress;
    private BigDecimal totalInvested;
    private BigDecimal currentValue;
    private BigDecimal unrealizedPnl;
    private BigDecimal realizedPnl;
    private BigDecimal totalPnl;
    private BigDecimal pnlPercentage;
    private BigDecimal averageCost;
    private BigDecimal stakingRewards;
    private List<TokenPnl> tokenBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TokenPnl {
        private String symbol;
        private BigDecimal amount;
        private BigDecimal avgBuyPrice;
        private BigDecimal currentPrice;
        private BigDecimal pnl;
        private BigDecimal pnlPercentage;
    }
}
