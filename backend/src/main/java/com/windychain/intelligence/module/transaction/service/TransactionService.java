package com.windychain.intelligence.module.transaction.service;

import com.windychain.intelligence.module.transaction.dto.TransactionResponse;
import com.windychain.intelligence.module.transaction.entity.Transaction;
import com.windychain.intelligence.module.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;

    @Cacheable(value = "transactions", key = "#address + '_' + #page + '_' + #size")
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(String address, int page, int size) {
        String normalizedAddress = address.toLowerCase();
        log.info("Fetching transactions for wallet: {}, page: {}", normalizedAddress, page);

        return transactionRepository
                .findByWalletAddressOrderByBlockTimestampDesc(normalizedAddress, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<Object[]> getTransactionTypeBreakdown(String address) {
        return transactionRepository.countByTypeForWallet(address.toLowerCase());
    }

    public String classifyTransaction(Transaction tx) {
        if (tx.getToAddress() == null) {
            return "contract_creation";
        }
        // Simplified classification — real implementation would check method signatures
        if (tx.getTokenAddress() != null && !tx.getTokenAddress().isBlank()) {
            return "swap";
        }
        return "transfer";
    }

    private TransactionResponse toResponse(Transaction tx) {
        return TransactionResponse.builder()
                .txHash(tx.getTxHash())
                .txType(tx.getTxType())
                .fromAddress(tx.getFromAddress())
                .toAddress(tx.getToAddress())
                .amount(tx.getAmount())
                .tokenSymbol(tx.getTokenSymbol())
                .gasUsed(tx.getGasUsed())
                .status(tx.getStatus())
                .blockTimestamp(tx.getBlockTimestamp())
                .build();
    }
}
