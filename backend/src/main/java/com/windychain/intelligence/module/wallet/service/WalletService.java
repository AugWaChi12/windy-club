package com.windychain.intelligence.module.wallet.service;

import com.windychain.intelligence.integration.BlockchainService;
import com.windychain.intelligence.module.transaction.repository.TransactionRepository;
import com.windychain.intelligence.module.wallet.dto.WalletResponse;
import com.windychain.intelligence.module.wallet.entity.Wallet;
import com.windychain.intelligence.module.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final BlockchainService blockchainService;

    @Cacheable(value = "wallet", key = "#address")
    @Transactional(readOnly = true)
    public WalletResponse getWalletInfo(String address) {
        String normalizedAddress = address.toLowerCase();
        log.info("Fetching wallet info for: {}", normalizedAddress);

        Wallet wallet = walletRepository.findByAddress(normalizedAddress)
                .orElseGet(() -> createWallet(normalizedAddress));

        BigDecimal balanceKub = blockchainService.getBalance(normalizedAddress);
        int txCount = (int) transactionRepository
                .findByWalletAddressOrderByBlockTimestampDesc(normalizedAddress, PageRequest.of(0, 1))
                .getTotalElements();

        return WalletResponse.builder()
                .address(wallet.getAddress())
                .label(wallet.getLabel())
                .behaviorType(wallet.getBehaviorType())
                .balanceKub(balanceKub)
                .balanceUsd(balanceKub.multiply(blockchainService.getKubPrice()))
                .totalTransactions(txCount)
                .firstSeenAt(wallet.getFirstSeenAt())
                .build();
    }

    @Transactional
    public Wallet createWallet(String address) {
        Wallet wallet = Wallet.builder()
                .address(address.toLowerCase())
                .behaviorType("unknown")
                .firstSeenAt(LocalDateTime.now())
                .build();
        return walletRepository.save(wallet);
    }
}
