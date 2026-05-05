package com.windychain.intelligence.module.staking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "staking_position")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StakingPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "wallet_address", nullable = false, length = 42)
    private String walletAddress;

    @Column(length = 42)
    private String validator;

    @Column(name = "amount_staked", nullable = false, precision = 38, scale = 18)
    @Builder.Default
    private BigDecimal amountStaked = BigDecimal.ZERO;

    @Column(name = "reward_earned", nullable = false, precision = 38, scale = 18)
    @Builder.Default
    private BigDecimal rewardEarned = BigDecimal.ZERO;

    @Column(name = "staked_at")
    private LocalDateTime stakedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
