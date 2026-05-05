package com.windychain.intelligence.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.websocket.WebSocketService;

import java.net.ConnectException;

@Configuration
public class BlockchainConfig {

    @Value("${blockchain.kub.rpc-url}")
    private String rpcUrl;

    @Value("${blockchain.kub.ws-url}")
    private String wsUrl;

    @Bean
    public Web3j web3jHttp() {
        return Web3j.build(new HttpService(rpcUrl));
    }

    @Bean
    public Web3j web3jWebSocket() {
        try {
            WebSocketService wsService = new WebSocketService(wsUrl, false);
            wsService.connect();
            return Web3j.build(wsService);
        } catch (ConnectException e) {
            // Fallback to HTTP if WebSocket connection fails
            return Web3j.build(new HttpService(rpcUrl));
        }
    }
}
