package com.windychain.intelligence.module.staking.repository;

import com.windychain.intelligence.module.staking.entity.StakingPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface StakingRepository extends JpaRepository<StakingPosition, Long> {

    List<StakingPosition> findByWalletAddress(String walletAddress);

    @Query("SELECT SUM(s.amountStaked) FROM StakingPosition s WHERE s.walletAddress = :address")
    BigDecimal getTotalStakedByWallet(@Param("address") String address);

    @Query("SELECT SUM(s.rewardEarned) FROM StakingPosition s WHERE s.walletAddress = :address")
    BigDecimal getTotalRewardsByWallet(@Param("address") String address);
}
