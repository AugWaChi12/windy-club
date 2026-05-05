package com.windychain.intelligence.module.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private String walletAddress;
    private String behaviorProfile;
    private Map<String, Long> transactionTypeBreakdown;
    private SpendingAnalysis spending;
    private BridgeAnalysis bridge;
    private List<ActivityPeriod> activityTimeline;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpendingAnalysis {
        private BigDecimal totalSpent;
        private BigDecimal gasSpent;
        private BigDecimal stakingSpent;
        private BigDecimal swapVolume;
        private BigDecimal bridgeVolume;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BridgeAnalysis {
        private BigDecimal totalBridgedIn;
        private BigDecimal totalBridgedOut;
        private BigDecimal netFlow;
        private int bridgeCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityPeriod {
        private String period;
        private long transactionCount;
        private BigDecimal volume;
    }
}
