package com.stockpilot.service;

import com.stockpilot.entity.InventoryReservation;
import com.stockpilot.entity.NotificationType;
import com.stockpilot.entity.ReservationStatus;
import com.stockpilot.repository.ReservationRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class ReservationExpiryJob {

    private final ReservationRepository reservationRepo;
    private final ReservationService reservationService;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 60_000) // every minute
    @Transactional
    public void expireStaleReservations() {
        List<InventoryReservation> expired = reservationRepo.findByStatusAndExpiresAtBefore(
            ReservationStatus.ACTIVE, 
            LocalDateTime.now()
        );
        
        for (InventoryReservation r : expired) {
            reservationService.release(r);
            r.setStatus(ReservationStatus.EXPIRED);
            reservationRepo.save(r);
            
            notificationService.push(
                NotificationType.RESERVATION_EXPIRED,
                "Reservation #" + r.getId() + " for SalesOrder #" + r.getSalesOrderId() + " expired and was automatically released"
            );
        }
    }
}
