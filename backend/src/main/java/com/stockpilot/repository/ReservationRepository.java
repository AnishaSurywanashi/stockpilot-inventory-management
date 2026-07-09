package com.stockpilot.repository;

import com.stockpilot.entity.InventoryReservation;
import com.stockpilot.entity.ReservationStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationRepository extends JpaRepository<InventoryReservation, Long> {
    List<InventoryReservation> findByStatusAndExpiresAtBefore(ReservationStatus status, LocalDateTime now);
}
