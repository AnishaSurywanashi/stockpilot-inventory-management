package com.stockpilot.service;

import com.stockpilot.dto.request.PurchaseOrderItemRequest;
import com.stockpilot.dto.request.PurchaseOrderRequest;
import com.stockpilot.dto.response.PurchaseOrderItemResponse;
import com.stockpilot.dto.response.PurchaseOrderResponse;
import com.stockpilot.entity.Inventory;
import com.stockpilot.entity.OrderStatus;
import com.stockpilot.entity.Product;
import com.stockpilot.entity.PurchaseOrder;
import com.stockpilot.entity.PurchaseOrderItem;
import com.stockpilot.entity.Supplier;
import com.stockpilot.entity.Warehouse;
import com.stockpilot.exception.NotFoundException;
import com.stockpilot.repository.InventoryRepository;
import com.stockpilot.repository.ProductRepository;
import com.stockpilot.repository.PurchaseOrderRepository;
import com.stockpilot.repository.SupplierRepository;
import com.stockpilot.repository.WarehouseRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final SupplierRepository supplierRepo;
    private final WarehouseRepository warehouseRepo;
    private final InventoryRepository inventoryRepo;
    private final AuditLogService auditLog;

    public List<PurchaseOrderResponse> findAll() {
        return orderRepo.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public PurchaseOrderResponse findById(Long id) {
        return orderRepo.findById(id)
            .map(this::mapToResponse)
            .orElseThrow(() -> new NotFoundException("Purchase Order not found"));
    }

    @Transactional
    public PurchaseOrderResponse create(PurchaseOrderRequest req) {
        if (orderRepo.findByOrderNumber(req.orderNumber()).isPresent()) {
            throw new IllegalArgumentException("Purchase Order number already exists");
        }

        Supplier supplier = supplierRepo.findById(req.supplierId())
            .orElseThrow(() -> new NotFoundException("Supplier not found"));

        Warehouse warehouse = warehouseRepo.findById(req.warehouseId())
            .orElseThrow(() -> new NotFoundException("Warehouse not found"));

        PurchaseOrder order = PurchaseOrder.builder()
            .orderNumber(req.orderNumber())
            .supplier(supplier)
            .warehouse(warehouse)
            .status(OrderStatus.CREATED)
            .createdAt(LocalDateTime.now())
            .items(new ArrayList<>())
            .build();

        PurchaseOrder savedOrder = orderRepo.save(order);

        for (PurchaseOrderItemRequest itemReq : req.items()) {
            Product p = productRepo.findById(itemReq.productId())
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + itemReq.productId()));

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                .purchaseOrder(savedOrder)
                .product(p)
                .quantity(itemReq.quantity())
                .unitPrice(itemReq.unitPrice())
                .build();

            savedOrder.getItems().add(item);
        }

        PurchaseOrder finalOrder = orderRepo.save(savedOrder);
        
        auditLog.record("CREATE", "PurchaseOrder", finalOrder.getId(), "Created PurchaseOrder #" + finalOrder.getOrderNumber());
        return mapToResponse(finalOrder);
    }

    @Transactional
    public void confirmOrder(Long id) {
        PurchaseOrder order = orderRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Purchase Order not found"));

        if (order.getStatus() == OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Purchase Order is already confirmed");
        }

        for (PurchaseOrderItem item : order.getItems()) {
            Inventory inv = inventoryRepo.findByProductIdAndWarehouseId(
                item.getProduct().getId(),
                order.getWarehouse().getId()
            ).orElseGet(() -> createEmptyInventory(item.getProduct(), order.getWarehouse()));

            inv.setQuantityOnHand(inv.getQuantityOnHand() + item.getQuantity());
            inventoryRepo.save(inv);
        }

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepo.save(order);
        auditLog.record("CONFIRM", "PurchaseOrder", id, "Confirmed PurchaseOrder #" + order.getOrderNumber() + " (added stock to " + order.getWarehouse().getName() + ")");
    }

    private Inventory createEmptyInventory(Product product, Warehouse warehouse) {
        return Inventory.builder()
            .product(product)
            .warehouse(warehouse)
            .quantityOnHand(0)
            .quantityReserved(0)
            .build();
    }

    private PurchaseOrderResponse mapToResponse(PurchaseOrder order) {
        List<PurchaseOrderItemResponse> items = order.getItems().stream()
            .map(item -> new PurchaseOrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getUnitPrice()
            ))
            .collect(Collectors.toList());

        return new PurchaseOrderResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getSupplier().getId(),
            order.getSupplier().getName(),
            order.getWarehouse().getId(),
            order.getWarehouse().getName(),
            order.getStatus(),
            items,
            order.getCreatedAt()
        );
    }
}
