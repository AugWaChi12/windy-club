package com.windychain.intelligence.module.alert.repository;

import com.windychain.intelligence.module.alert.entity.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    Page<Alert> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Alert> findByAlertTypeOrderByCreatedAtDesc(String alertType);

    List<Alert> findByReadFalseOrderByCreatedAtDesc();

    long countByReadFalse();
}
