package com.windychain.intelligence.module.wallet.controller;

import com.windychain.intelligence.module.wallet.dto.WalletResponse;
import com.windychain.intelligence.module.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/{address}")
    public ResponseEntity<WalletResponse> getWallet(@PathVariable String address) {
        if (!isValidEthAddress(address)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(walletService.getWalletInfo(address));
    }

    private boolean isValidEthAddress(String address) {
        return address != null && address.matches("^0x[a-fA-F0-9]{40}$");
    }
}
