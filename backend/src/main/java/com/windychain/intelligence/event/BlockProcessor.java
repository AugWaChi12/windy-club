package com.windychain.intelligence.event;

import com.windychain.intelligence.integration.BlockchainService;
import com.windychain.intelligence.module.alert.service.AlertService;
import com.windychain.intelligence.module.transaction.entity.Transaction;
import com.windychain.intelligence.module.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.web3j.protocol.core.methods.response.EthBlock;
import org.web3j.utils.Convert;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.concurrent.atomic.AtomicReference;

@Component
@RequiredArgsConstructor
@Slf4j
public class BlockProcessor {

    private final BlockchainService blockchainService;
    private final TransactionRepository transactionRepository;
    private final AlertService alertService;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${analytics.whale-threshold}")
    private BigDecimal whaleThreshold;

    private final AtomicReference<BigInteger> lastProcessedBlock = new AtomicReference<>(BigInteger.ZERO);

    @Scheduled(fixedDelayString = "${blockchain.polling.interval-ms}")
    public void pollNewBlocks() {
        try {
            BigInteger latestBlock = blockchainService.getLatestBlockNumber();
            BigInteger lastBlock = lastProcessedBlock.get();

            if (lastBlock.equals(BigInteger.ZERO)) {
                // First run: start from latest block
                lastProcessedBlock.set(latestBlock);
                log.info("Block processor initialized at block: {}", latestBlock);
                return;
            }

            if (latestBlock.compareTo(lastBlock) > 0) {
                for (BigInteger blockNum = lastBlock.add(BigInteger.ONE);
                     blockNum.compareTo(latestBlock) <= 0;
                     blockNum = blockNum.add(BigInteger.ONE)) {
                    processBlock(blockNum);
                }
                lastProcessedBlock.set(latestBlock);
            }
        } catch (Exception e) {
            log.error("Error polling blocks: {}", e.getMessage());
        }
    }

    private void processBlock(BigInteger blockNumber) {
        EthBlock.Block block = blockchainService.getBlock(blockNumber);
        if (block == null || block.getTransactions() == null) return;

        LocalDateTime blockTime = LocalDateTime.ofInstant(
                Instant.ofEpochSecond(block.getTimestamp().longValue()),
                ZoneId.systemDefault()
        );

        for (EthBlock.TransactionResult<?> txResult : block.getTransactions()) {
            EthBlock.TransactionObject txObj = (EthBlock.TransactionObject) txResult.get();
            processTransaction(txObj, blockNumber, blockTime);
        }

        // Push block update via WebSocket
        messagingTemplate.convertAndSend("/topic/blocks", blockNumber);
    }

    private void processTransaction(EthBlock.TransactionObject txObj, BigInteger blockNumber, LocalDateTime blockTime) {
        String txHash = txObj.getHash();

        if (transactionRepository.existsByTxHash(txHash)) return;

        BigDecimal amountKub = Convert.fromWei(new BigDecimal(txObj.getValue()), Convert.Unit.ETHER);

        Transaction transaction = Transaction.builder()
                .walletAddress(txObj.getFrom().toLowerCase())
                .txHash(txHash)
                .blockNumber(blockNumber.longValue())
                .txType("transfer")
                .fromAddress(txObj.getFrom().toLowerCase())
                .toAddress(txObj.getTo() != null ? txObj.getTo().toLowerCase() : null)
                .amount(amountKub)
                .tokenSymbol("KUB")
                .gasUsed(new BigDecimal(txObj.getGas()))
                .gasPrice(Convert.fromWei(new BigDecimal(txObj.getGasPrice()), Convert.Unit.GWEI))
                .status("success")
                .blockTimestamp(blockTime)
                .build();

        transactionRepository.save(transaction);

        // Whale detection
        if (amountKub.compareTo(whaleThreshold) >= 0) {
            alertService.createWhaleAlert(txObj.getFrom(), txHash, amountKub);
        }
    }
}
