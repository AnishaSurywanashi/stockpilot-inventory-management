package com.stockpilot.service;

import com.stockpilot.dto.request.ReserveStockRequest;
import com.stockpilot.entity.Inventory;
import com.stockpilot.entity.InventoryReservation;
import com.stockpilot.entity.ReservationStatus;
import com.stockpilot.exception.InsufficientStockException;
import com.stockpilot.exception.NotFoundException;
import com.stockpilot.repository.InventoryRepository;
import com.stockpilot.repository.ReservationRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final InventoryRepository inventoryRepo;
    private final ReservationRepository reservationRepo;
    private final AuditLogService auditLog;

    @Transactional
    public InventoryReservation reserve(ReserveStockRequest req) {
        Inventory inv = inventoryRepo
            .findByProductIdAndWarehouseId(req.productId(), req.warehouseId())
            .orElseThrow(() -> new NotFoundException("Inventory not found for product id: " + req.productId() + " in warehouse id: " + req.warehouseId()));
            
        if (inv.getAvailable() < req.quantity()) {
            throw new InsufficientStockException("Only " + inv.getAvailable() + " available");
        }
        
        inv.setQuantityReserved(inv.getQuantityReserved() + req.quantity());
        inventoryRepo.save(inv); // @Version guards against lost updates
        
        InventoryReservation r = InventoryReservation.builder()
            .inventory(inv)
            .quantity(req.quantity())
            .status(ReservationStatus.ACTIVE)
            .expiresAt(LocalDateTime.now().plusMinutes(15))
            .salesOrderId(req.salesOrderId())
            .build();
            
        auditLog.record("RESERVE", "Inventory", inv.getId(), "Reserved " + req.quantity() + " units for SalesOrder: " + req.salesOrderId());
        return reservationRepo.save(r);
    }

    @Transactional
    public void confirm(Long reservationId) {
        InventoryReservation r = reservationRepo.findById(reservationId)
            .orElseThrow(() -> new NotFoundException("Reservation not found"));
            
        if (r.getStatus() != ReservationStatus.ACTIVE) {
            throw new IllegalStateException("Reservation is not active");
        }
        
        Inventory inv = r.getInventory();
        // Reserved stock actually leaves the warehouse
        inv.setQuantityReserved(inv.getQuantityReserved() - r.getQuantity());
        inv.setQuantityOnHand(inv.getQuantityOnHand() - r.getQuantity());
        r.setStatus(ReservationStatus.CONFIRMED);
        
        inventoryRepo.save(inv);
        reservationRepo.save(r);
        auditLog.record("CONFIRM", "Inventory", inv.getId(), "Confirmed reserve: " + r.getQuantity() + " units");
    }

    @Transactional
    public void release(InventoryReservation r) {
        Inventory inv = r.getInventory();
        inv.setQuantityReserved(inv.getQuantityReserved() - r.getQuantity());
        r.setStatus(ReservationStatus.RELEASED);
        
        inventoryRepo.save(inv);
        reservationRepo.save(r);
        auditLog.record("RELEASE", "Inventory", inv.getId(), "Released reserve: " + r.getQuantity() + " units");
    }
}
