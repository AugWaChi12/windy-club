package com.windychain.intelligence.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthBlock;
import org.web3j.protocol.core.methods.response.EthGetBalance;
import org.web3j.utils.Convert;

import java.math.BigDecimal;
import java.math.BigInteger;

@Service
@Slf4j
public class BlockchainService {

    private final Web3j web3j;

    public BlockchainService(@Qualifier("web3jHttp") Web3j web3j) {
        this.web3j = web3j;
    }

    @Cacheable(value = "balance", key = "#address")
    public BigDecimal getBalance(String address) {
        try {
            EthGetBalance balance = web3j.ethGetBalance(address, DefaultBlockParameterName.LATEST).send();
            BigInteger wei = balance.getBalance();
            return Convert.fromWei(new BigDecimal(wei), Convert.Unit.ETHER);
        } catch (Exception e) {
            log.error("Failed to fetch balance for {}: {}", address, e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    public BigInteger getLatestBlockNumber() {
        try {
            return web3j.ethBlockNumber().send().getBlockNumber();
        } catch (Exception e) {
            log.error("Failed to fetch latest block number: {}", e.getMessage());
            return BigInteger.ZERO;
        }
    }

    public EthBlock.Block getBlock(BigInteger blockNumber) {
        try {
            return web3j.ethGetBlockByNumber(
                    org.web3j.protocol.core.DefaultBlockParameter.valueOf(blockNumber), true
            ).send().getBlock();
        } catch (Exception e) {
            log.error("Failed to fetch block {}: {}", blockNumber, e.getMessage());
            return null;
        }
    }

    @Cacheable(value = "kubPrice")
    public BigDecimal getKubPrice() {
        // In production, fetch from DEX or price oracle
        // For MVP, return mock price
        return BigDecimal.valueOf(2.50);
    }

    public long getChainId() {
        try {
            return web3j.ethChainId().send().getChainId().longValue();
        } catch (Exception e) {
            log.error("Failed to get chain ID: {}", e.getMessage());
            return 96L; // KUB Chain default
        }
    }
}
