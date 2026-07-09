package com.stockpilot.service;

import com.stockpilot.entity.Inventory;
import com.stockpilot.entity.NotificationType;
import com.stockpilot.repository.InventoryRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LowStockAlertService {

    private final InventoryRepository inventoryRepo;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 300_000) // every 5 min
    public void checkLowStock() {
        // Query low stock items based on default threshold of 10 or custom product threshold
        List<Inventory> allInventory = inventoryRepo.findAll();
        for (Inventory inv : allInventory) {
            int threshold = inv.getProduct().getLowStockThreshold() != null 
                ? inv.getProduct().getLowStockThreshold() 
                : 10;
            
            if (inv.getAvailable() < threshold) {
                notificationService.push(
                    NotificationType.LOW_STOCK,
                    "Low stock alert: " + inv.getProduct().getName() + 
                    " at " + inv.getWarehouse().getName() + 
                    " (Available: " + inv.getAvailable() + ", Threshold: " + threshold + ")"
                );
            }
        }
    }
}
