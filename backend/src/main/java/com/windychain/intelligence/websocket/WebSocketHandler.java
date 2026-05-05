package com.windychain.intelligence.websocket;

import com.windychain.intelligence.module.alert.entity.Alert;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketHandler {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/subscribe/wallet/{address}")
    @SendTo("/topic/wallet/{address}")
    public String subscribeToWallet(@DestinationVariable String address) {
        log.info("Client subscribed to wallet updates: {}", address);
        return "Subscribed to wallet: " + address;
    }

    @MessageMapping("/subscribe/alerts")
    @SendTo("/topic/alerts")
    public String subscribeToAlerts() {
        log.info("Client subscribed to alerts");
        return "Subscribed to alerts";
    }

    public void pushWalletUpdate(String address, Object data) {
        messagingTemplate.convertAndSend("/topic/wallet/" + address, data);
    }

    public void pushAlert(Alert alert) {
        messagingTemplate.convertAndSend("/topic/alerts", alert);
    }

    public void pushBlockUpdate(Long blockNumber) {
        messagingTemplate.convertAndSend("/topic/blocks", blockNumber);
    }
}
