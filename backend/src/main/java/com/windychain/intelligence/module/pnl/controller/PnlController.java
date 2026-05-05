package com.windychain.intelligence.module.pnl.controller;

import com.windychain.intelligence.module.pnl.dto.PnlResponse;
import com.windychain.intelligence.module.pnl.service.PnlService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pnl")
@RequiredArgsConstructor
public class PnlController {

    private final PnlService pnlService;

    @GetMapping("/{address}")
    public ResponseEntity<PnlResponse> getPnl(@PathVariable String address) {
        if (!isValidEthAddress(address)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(pnlService.calculatePnl(address));
    }

    private boolean isValidEthAddress(String address) {
        return address != null && address.matches("^0x[a-fA-F0-9]{40}$");
    }
}
