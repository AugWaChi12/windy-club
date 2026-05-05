package com.windychain.intelligence.module.analytics.controller;

import com.windychain.intelligence.module.analytics.dto.AnalyticsResponse;
import com.windychain.intelligence.module.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/{address}")
    public ResponseEntity<AnalyticsResponse> getAnalytics(@PathVariable String address) {
        if (!isValidEthAddress(address)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(analyticsService.getAnalytics(address));
    }

    private boolean isValidEthAddress(String address) {
        return address != null && address.matches("^0x[a-fA-F0-9]{40}$");
    }
}
