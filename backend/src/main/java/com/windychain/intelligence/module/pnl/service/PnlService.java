package com.windychain.intelligence.module.pnl.service;

import com.windychain.intelligence.integration.BlockchainService;
import com.windychain.intelligence.module.pnl.dto.PnlResponse;
import com.windychain.intelligence.module.staking.repository.StakingRepository;
import com.windychain.intelligence.module.transaction.entity.Transaction;
import com.windychain.intelligence.module.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PnlService {

    private final TransactionRepository transactionRepository;
    private final StakingRepository stakingRepository;
    private final BlockchainService blockchainService;

    @Cacheable(value = "pnl", key = "#address")
    public PnlResponse calculatePnl(String address) {
        String normalizedAddress = address.toLowerCase();
        log.info("Calculating PnL for wallet: {}", normalizedAddress);

        List<Transaction> transactions = transactionRepository
                .findByWalletAddressOrderByBlockTimestampDesc(normalizedAddress, PageRequest.of(0, 1000))
                .getContent();

        BigDecimal totalIn = BigDecimal.ZERO;
        BigDecimal totalOut = BigDecimal.ZERO;

        for (Transaction tx : transactions) {
            if (tx.getToAddress() != null && tx.getToAddress().equalsIgnoreCase(normalizedAddress)) {
                totalIn = totalIn.add(tx.getAmount());
            } else if (tx.getFromAddress().equalsIgnoreCase(normalizedAddress)) {
                totalOut = totalOut.add(tx.getAmount());
            }
        }

        BigDecimal currentBalance = blockchainService.getBalance(normalizedAddress);
        BigDecimal kubPrice = blockchainService.getKubPrice();
        BigDecimal currentValue = currentBalance.multiply(kubPrice);
        BigDecimal totalInvested = totalIn.multiply(kubPrice);
        BigDecimal totalPnl = currentValue.subtract(totalInvested);

        BigDecimal pnlPercentage = BigDecimal.ZERO;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            pnlPercentage = totalPnl.divide(totalInvested, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        BigDecimal avgCost = BigDecimal.ZERO;
        if (currentBalance.compareTo(BigDecimal.ZERO) > 0) {
            avgCost = totalIn.divide(currentBalance, 8, RoundingMode.HALF_UP);
        }

        BigDecimal stakingRewards = stakingRepository.getTotalRewardsByWallet(normalizedAddress);
        if (stakingRewards == null) {
            stakingRewards = BigDecimal.ZERO;
        }

        return PnlResponse.builder()
                .walletAddress(normalizedAddress)
                .totalInvested(totalInvested)
                .currentValue(currentValue)
                .unrealizedPnl(totalPnl)
                .realizedPnl(BigDecimal.ZERO)
                .totalPnl(totalPnl)
                .pnlPercentage(pnlPercentage)
                .averageCost(avgCost)
                .stakingRewards(stakingRewards)
                .tokenBreakdown(new ArrayList<>())
                .build();
    }
}
