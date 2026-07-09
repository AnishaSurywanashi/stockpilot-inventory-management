package com.stockpilot.service;

import com.stockpilot.entity.Inventory;
import com.stockpilot.entity.Product;
import com.stockpilot.entity.StockTransfer;
import com.stockpilot.entity.StockTransferItem;
import com.stockpilot.entity.TransferStatus;
import com.stockpilot.entity.Warehouse;
import com.stockpilot.exception.InsufficientStockException;
import com.stockpilot.exception.NotFoundException;
import com.stockpilot.repository.InventoryRepository;
import com.stockpilot.repository.StockTransferRepository;
import com.stockpilot.entity.NotificationType;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StockTransferService {

    private final InventoryRepository inventoryRepo;
    private final StockTransferRepository transferRepo;
    private final NotificationService notificationService;
    private final AuditLogService auditLog;

    @Transactional // all items move, or none do (rolls back entire loop if fails)
    public StockTransfer transfer(StockTransfer transfer) {
        transfer.setCreatedAt(LocalDateTime.now());
        
        for (StockTransferItem item : transfer.getItems()) {
            Inventory from = inventoryRepo.findByProductIdAndWarehouseId(
                item.getProduct().getId(), 
                transfer.getFromWarehouse().getId()
            ).orElseThrow(() -> new NotFoundException(
                "Source inventory not found for product: " + item.getProduct().getName()
            ));
            
            if (from.getAvailable() < item.getQuantity()) {
                throw new InsufficientStockException(
                    "Not enough stock to transfer product: " + item.getProduct().getName() + 
                    " (Available: " + from.getAvailable() + ", Requested: " + item.getQuantity() + ")"
                ); // rolls back everything
            }
            
            from.setQuantityOnHand(from.getQuantityOnHand() - item.getQuantity());
            
            Inventory to = inventoryRepo.findByProductIdAndWarehouseId(
                item.getProduct().getId(), 
                transfer.getToWarehouse().getId()
            ).orElseGet(() -> createEmptyInventory(
                item.getProduct(), 
                transfer.getToWarehouse()
            ));
            
            to.setQuantityOnHand(to.getQuantityOnHand() + item.getQuantity());
            
            inventoryRepo.save(from);
            inventoryRepo.save(to);
        }
        
        transfer.setStatus(TransferStatus.COMPLETED);
        StockTransfer saved = transferRepo.save(transfer);
        
        auditLog.record("TRANSFER", "StockTransfer", saved.getId(),
            "Transfer #" + saved.getId() + " from " + transfer.getFromWarehouse().getCode() + " -> " + transfer.getToWarehouse().getCode());
            
        notificationService.push(NotificationType.TRANSFER_COMPLETED,
            "Transfer #" + saved.getId() + " from " + transfer.getFromWarehouse().getName() + 
            " to " + transfer.getToWarehouse().getName() + " completed successfully");
            
        return saved;
    }

    private Inventory createEmptyInventory(Product product, Warehouse warehouse) {
        return Inventory.builder()
            .product(product)
            .warehouse(warehouse)
            .quantityOnHand(0)
            .quantityReserved(0)
            .build();
    }
}
