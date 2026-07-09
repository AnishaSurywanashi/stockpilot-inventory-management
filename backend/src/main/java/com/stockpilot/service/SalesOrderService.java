package com.stockpilot.service;

import com.stockpilot.dto.request.ReserveStockRequest;
import com.stockpilot.dto.request.SalesOrderItemRequest;
import com.stockpilot.dto.request.SalesOrderRequest;
import com.stockpilot.dto.response.SalesOrderItemResponse;
import com.stockpilot.dto.response.SalesOrderResponse;
import com.stockpilot.entity.Inventory;
import com.stockpilot.entity.OrderStatus;
import com.stockpilot.entity.Product;
import com.stockpilot.entity.SalesOrder;
import com.stockpilot.entity.SalesOrderItem;
import com.stockpilot.entity.InventoryReservation;
import com.stockpilot.entity.ReservationStatus;
import com.stockpilot.exception.InsufficientStockException;
import com.stockpilot.exception.NotFoundException;
import com.stockpilot.repository.InventoryRepository;
import com.stockpilot.repository.ProductRepository;
import com.stockpilot.repository.SalesOrderRepository;
import com.stockpilot.repository.ReservationRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final InventoryRepository inventoryRepo;
    private final ReservationService reservationService;
    private final ReservationRepository reservationRepo;
    private final AuditLogService auditLog;

    public List<SalesOrderResponse> findAll() {
        return orderRepo.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public SalesOrderResponse findById(Long id) {
        return orderRepo.findById(id)
            .map(this::mapToResponse)
            .orElseThrow(() -> new NotFoundException("Sales Order not found"));
    }

    @Transactional
    public SalesOrderResponse create(SalesOrderRequest req) {
        if (orderRepo.findByOrderNumber(req.orderNumber()).isPresent()) {
            throw new IllegalArgumentException("Sales Order number already exists");
        }

        SalesOrder order = SalesOrder.builder()
            .orderNumber(req.orderNumber())
            .status(OrderStatus.CREATED)
            .createdAt(LocalDateTime.now())
            .items(new ArrayList<>())
            .build();

        SalesOrder savedOrder = orderRepo.save(order);

        for (SalesOrderItemRequest itemReq : req.items()) {
            Product p = productRepo.findById(itemReq.productId())
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + itemReq.productId()));

            // Relational mapping
            SalesOrderItem item = SalesOrderItem.builder()
                .salesOrder(savedOrder)
                .product(p)
                .quantity(itemReq.quantity())
                .unitPrice(itemReq.unitPrice())
                .build();

            savedOrder.getItems().add(item);

            // Reserve stock dynamically scanning warehouses for available stock
            List<Inventory> inventories = inventoryRepo.findAll().stream()
                .filter(inv -> inv.getProduct().getId().equals(p.getId()))
                .collect(Collectors.toList());

            Inventory sourceInv = null;
            for (Inventory inv : inventories) {
                if (inv.getAvailable() >= itemReq.quantity()) {
                    sourceInv = inv;
                    break;
                }
            }

            if (sourceInv == null) {
                throw new InsufficientStockException("Insufficient stock in any warehouse for product: " + p.getName() + " (Requested: " + itemReq.quantity() + ")");
            }

            // Perform reservation
            reservationService.reserve(new ReserveStockRequest(
                p.getId(),
                sourceInv.getWarehouse().getId(),
                itemReq.quantity(),
                savedOrder.getId()
            ));
        }

        savedOrder.setStatus(OrderStatus.RESERVED);
        SalesOrder finalOrder = orderRepo.save(savedOrder);
        
        auditLog.record("CREATE", "SalesOrder", finalOrder.getId(), "Created SalesOrder #" + finalOrder.getOrderNumber() + " with stock reserved.");
        return mapToResponse(finalOrder);
    }

    @Transactional
    public void confirmOrder(Long id) {
        SalesOrder order = orderRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Sales Order not found"));

        if (order.getStatus() != OrderStatus.RESERVED) {
            throw new IllegalStateException("Sales Order must be in RESERVED status to confirm");
        }

        // Find active reservations for this salesOrderId
        List<InventoryReservation> reservations = reservationRepo.findAll().stream()
            .filter(r -> r.getSalesOrderId() != null && r.getSalesOrderId().equals(id) && r.getStatus() == ReservationStatus.ACTIVE)
            .collect(Collectors.toList());

        for (InventoryReservation r : reservations) {
            reservationService.confirm(r.getId());
        }

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepo.save(order);
        auditLog.record("CONFIRM", "SalesOrder", id, "Confirmed and fulfilled SalesOrder #" + order.getOrderNumber());
    }

    @Transactional
    public void cancelOrder(Long id) {
        SalesOrder order = orderRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Sales Order not found"));

        if (order.getStatus() == OrderStatus.CONFIRMED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot cancel an order in CONFIRMED or CANCELLED status");
        }

        // Release all active reservations for this salesOrderId
        List<InventoryReservation> reservations = reservationRepo.findAll().stream()
            .filter(r -> r.getSalesOrderId() != null && r.getSalesOrderId().equals(id) && r.getStatus() == ReservationStatus.ACTIVE)
            .collect(Collectors.toList());

        for (InventoryReservation r : reservations) {
            reservationService.release(r);
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepo.save(order);
        auditLog.record("CANCEL", "SalesOrder", id, "Cancelled SalesOrder #" + order.getOrderNumber() + " and released reservations.");
    }

    private SalesOrderResponse mapToResponse(SalesOrder order) {
        List<SalesOrderItemResponse> items = order.getItems().stream()
            .map(item -> new SalesOrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getUnitPrice()
            ))
            .collect(Collectors.toList());

        return new SalesOrderResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getStatus(),
            items,
            order.getCreatedAt()
        );
    }
}
