package com.windychain.intelligence.module.wallet.repository;

import com.windychain.intelligence.module.wallet.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByAddress(String address);

    boolean existsByAddress(String address);
}
