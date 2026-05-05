package com.windychain.intelligence.module.analytics.service;

import com.windychain.intelligence.module.analytics.dto.AnalyticsResponse;
import com.windychain.intelligence.module.transaction.entity.Transaction;
import com.windychain.intelligence.module.transaction.repository.TransactionRepository;
import com.windychain.intelligence.module.wallet.entity.Wallet;
import com.windychain.intelligence.module.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    @Cacheable(value = "analytics", key = "#address")
    public AnalyticsResponse getAnalytics(String address) {
        String normalizedAddress = address.toLowerCase();
        log.info("Computing analytics for wallet: {}", normalizedAddress);

        List<Transaction> transactions = transactionRepository
                .findByWalletAddressOrderByBlockTimestampDesc(normalizedAddress, PageRequest.of(0, 5000))
                .getContent();

        Map<String, Long> typeBreakdown = new HashMap<>();
        BigDecimal totalGas = BigDecimal.ZERO;
        BigDecimal swapVolume = BigDecimal.ZERO;
        BigDecimal bridgeIn = BigDecimal.ZERO;
        BigDecimal bridgeOut = BigDecimal.ZERO;

        for (Transaction tx : transactions) {
            typeBreakdown.merge(tx.getTxType(), 1L, Long::sum);

            if (tx.getGasUsed() != null && tx.getGasPrice() != null) {
                totalGas = totalGas.add(tx.getGasUsed().multiply(tx.getGasPrice()));
            }

            switch (tx.getTxType()) {
                case "swap" -> swapVolume = swapVolume.add(tx.getAmount());
                case "bridge_in" -> bridgeIn = bridgeIn.add(tx.getAmount());
                case "bridge_out" -> bridgeOut = bridgeOut.add(tx.getAmount());
            }
        }

        String behaviorProfile = classifyBehavior(typeBreakdown, transactions.size());
        updateWalletBehavior(normalizedAddress, behaviorProfile);

        AnalyticsResponse.SpendingAnalysis spending = AnalyticsResponse.SpendingAnalysis.builder()
                .totalSpent(BigDecimal.ZERO)
                .gasSpent(totalGas)
                .stakingSpent(BigDecimal.ZERO)
                .swapVolume(swapVolume)
                .bridgeVolume(bridgeIn.add(bridgeOut))
                .build();

        AnalyticsResponse.BridgeAnalysis bridge = AnalyticsResponse.BridgeAnalysis.builder()
                .totalBridgedIn(bridgeIn)
                .totalBridgedOut(bridgeOut)
                .netFlow(bridgeIn.subtract(bridgeOut))
                .bridgeCount((int) (typeBreakdown.getOrDefault("bridge_in", 0L)
                        + typeBreakdown.getOrDefault("bridge_out", 0L)))
                .build();

        return AnalyticsResponse.builder()
                .walletAddress(normalizedAddress)
                .behaviorProfile(behaviorProfile)
                .transactionTypeBreakdown(typeBreakdown)
                .spending(spending)
                .bridge(bridge)
                .activityTimeline(List.of())
                .build();
    }

    private String classifyBehavior(Map<String, Long> types, int totalTx) {
        if (totalTx == 0) return "inactive";

        long swaps = types.getOrDefault("swap", 0L);
        long stakes = types.getOrDefault("staking", 0L);
        long transfers = types.getOrDefault("transfer", 0L);

        double swapRatio = (double) swaps / totalTx;
        double stakeRatio = (double) stakes / totalTx;

        if (swapRatio > 0.5) return "trader";
        if (stakeRatio > 0.3) return "staker";
        if (totalTx < 10 && transfers > swaps) return "holder";
        return "active_user";
    }

    private void updateWalletBehavior(String address, String behaviorProfile) {
        walletRepository.findByAddress(address).ifPresent(wallet -> {
            wallet.setBehaviorType(behaviorProfile);
            walletRepository.save(wallet);
        });
    }
}
