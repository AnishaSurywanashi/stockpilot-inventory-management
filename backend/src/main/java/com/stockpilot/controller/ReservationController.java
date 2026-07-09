package com.stockpilot.controller;

import com.stockpilot.dto.request.ReserveStockRequest;
import com.stockpilot.entity.InventoryReservation;
import com.stockpilot.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<InventoryReservation> reserve(@Valid @RequestBody ReserveStockRequest req) {
        return ResponseEntity.ok(reservationService.reserve(req));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Void> confirm(@PathVariable Long id) {
        reservationService.confirm(id);
        return ResponseEntity.ok().build();
    }
}
