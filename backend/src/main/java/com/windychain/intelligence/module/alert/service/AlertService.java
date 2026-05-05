package com.windychain.intelligence.module.alert.service;

import com.windychain.intelligence.module.alert.entity.Alert;
import com.windychain.intelligence.module.alert.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void createWhaleAlert(String walletAddress, String txHash, BigDecimal amount) {
        Alert alert = Alert.builder()
                .alertType("whale_transaction")
                .severity("warning")
                .title(String.format("🐋 Whale Alert: %.2f KUB moved", amount))
                .message(String.format("Large transaction detected from %s", walletAddress))
                .walletAddress(walletAddress)
                .txHash(txHash)
                .amount(amount)
                .build();

        Alert saved = alertRepository.save(alert);
        log.info("Whale alert created: {} KUB from {}", amount, walletAddress);

        // Push real-time alert via WebSocket
        messagingTemplate.convertAndSend("/topic/alerts", saved);
    }

    public void createNewTokenAlert(String tokenAddress, String symbol) {
        Alert alert = Alert.builder()
                .alertType("new_token")
                .severity("info")
                .title(String.format("🪙 New Token Detected: %s", symbol))
                .message(String.format("New contract deployed at %s", tokenAddress))
                .walletAddress(tokenAddress)
                .build();

        Alert saved = alertRepository.save(alert);
        messagingTemplate.convertAndSend("/topic/alerts", saved);
    }

    public Page<Alert> getAlerts(int page, int size) {
        return alertRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public List<Alert> getUnreadAlerts() {
        return alertRepository.findByReadFalseOrderByCreatedAtDesc();
    }

    public long getUnreadCount() {
        return alertRepository.countByReadFalse();
    }
}
