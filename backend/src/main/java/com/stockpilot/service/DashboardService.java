package com.stockpilot.service;

import com.stockpilot.entity.Inventory;
import com.stockpilot.entity.SalesOrder;
import com.stockpilot.entity.Warehouse;
import com.stockpilot.entity.OrderStatus;
import com.stockpilot.repository.InventoryRepository;
import com.stockpilot.repository.ProductRepository;
import com.stockpilot.repository.SalesOrderRepository;
import com.stockpilot.repository.WarehouseRepository;
import com.stockpilot.repository.ReservationRepository;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepo;
    private final WarehouseRepository warehouseRepo;
    private final InventoryRepository inventoryRepo;
    private final SalesOrderRepository salesOrderRepo;
    private final ReservationRepository reservationRepo;

    public Map<String, Object> getSummaryStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalProducts = productRepo.count();
        long totalWarehouses = warehouseRepo.count();
        long salesOrderCount = salesOrderRepo.count();
        
        // Low Stock Count
        List<Inventory> allInventory = inventoryRepo.findAll();
        long lowStockCount = allInventory.stream()
            .filter(inv -> {
                int threshold = inv.getProduct().getLowStockThreshold() != null 
                    ? inv.getProduct().getLowStockThreshold() 
                    : 10;
                return inv.getAvailable() < threshold;
            })
            .count();

        stats.put("totalProducts", totalProducts);
        stats.put("totalWarehouses", totalWarehouses);
        stats.put("salesOrderCount", salesOrderCount);
        stats.put("lowStockCount", lowStockCount);
        return stats;
    }

    public List<Map<String, Object>> getInventoryValueByWarehouse() {
        List<Inventory> allInventory = inventoryRepo.findAll();
        Map<Warehouse, BigDecimal> valueMap = new HashMap<>();

        for (Inventory inv : allInventory) {
            BigDecimal qty = BigDecimal.valueOf(inv.getQuantityOnHand());
            BigDecimal price = inv.getProduct().getUnitPrice() != null ? inv.getProduct().getUnitPrice() : BigDecimal.ZERO;
            BigDecimal value = qty.multiply(price);
            
            valueMap.put(inv.getWarehouse(), valueMap.getOrDefault(inv.getWarehouse(), BigDecimal.ZERO).add(value));
        }

        List<Map<String, Object>> result = new ArrayList<>();
        valueMap.forEach((wh, val) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("warehouseCode", wh.getCode());
            map.put("warehouseName", wh.getName());
            map.put("totalValue", val);
            result.add(map);
        });
        return result;
    }

    public List<Map<String, Object>> getOrdersOverTime() {
        List<SalesOrder> orders = salesOrderRepo.findAll();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        Map<String, Long> groups = orders.stream()
            .filter(o -> o.getCreatedAt() != null)
            .collect(Collectors.groupingBy(
                o -> o.getCreatedAt().format(formatter),
                Collectors.counting()
            ));

        List<Map<String, Object>> result = new ArrayList<>();
        groups.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(entry -> {
                Map<String, Object> map = new HashMap<>();
                map.put("date", entry.getKey());
                map.put("orderCount", entry.getValue());
                result.add(map);
            });
        return result;
    }

    public List<Map<String, Object>> getLowStockDistribution() {
        List<Inventory> allInventory = inventoryRepo.findAll();
        Map<String, Long> distMap = new HashMap<>();

        for (Inventory inv : allInventory) {
            int threshold = inv.getProduct().getLowStockThreshold() != null 
                ? inv.getProduct().getLowStockThreshold() 
                : 10;
            if (inv.getAvailable() < threshold) {
                String whName = inv.getWarehouse().getName();
                distMap.put(whName, distMap.getOrDefault(whName, 0L) + 1);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        distMap.forEach((wh, count) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("warehouseName", wh);
            map.put("lowStockCount", count);
            result.add(map);
        });
        return result;
    }
}
