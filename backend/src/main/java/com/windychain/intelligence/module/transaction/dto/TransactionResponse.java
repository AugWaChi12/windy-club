package com.windychain.intelligence.module.transaction.dto;

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
public class TransactionResponse {
    private String txHash;
    private String txType;
    private String fromAddress;
    private String toAddress;
    private BigDecimal amount;
    private String tokenSymbol;
    private BigDecimal gasUsed;
    private String status;
    private LocalDateTime blockTimestamp;
}
