package com.windychain.intelligence.module.alert.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "alert")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alert_type", nullable = false, length = 30)
    private String alertType;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String severity = "info";

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "wallet_address", length = 42)
    private String walletAddress;

    @Column(name = "tx_hash", length = 66)
    private String txHash;

    @Column(precision = 38, scale = 18)
    private BigDecimal amount;

    @Column(nullable = false)
    @Builder.Default
    private Boolean read = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
