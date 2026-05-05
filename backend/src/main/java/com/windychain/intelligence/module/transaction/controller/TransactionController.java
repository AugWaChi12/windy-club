package com.windychain.intelligence.module.transaction.controller;

import com.windychain.intelligence.module.transaction.dto.TransactionResponse;
import com.windychain.intelligence.module.transaction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tx")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/{address}")
    public ResponseEntity<Page<TransactionResponse>> getTransactions(
            @PathVariable String address,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        if (!isValidEthAddress(address)) {
            return ResponseEntity.badRequest().build();
        }
        if (size > 100) size = 100;

        return ResponseEntity.ok(transactionService.getTransactions(address, page, size));
    }

    private boolean isValidEthAddress(String address) {
        return address != null && address.matches("^0x[a-fA-F0-9]{40}$");
    }
}
