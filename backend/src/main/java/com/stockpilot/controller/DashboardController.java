package com.stockpilot.controller;

import com.stockpilot.service.DashboardService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSummaryStats() {
        return ResponseEntity.ok(dashboardService.getSummaryStats());
    }

    @GetMapping("/inventory-value")
    public ResponseEntity<List<Map<String, Object>>> getInventoryValueByWarehouse() {
        return ResponseEntity.ok(dashboardService.getInventoryValueByWarehouse());
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getOrdersOverTime() {
        return ResponseEntity.ok(dashboardService.getOrdersOverTime());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Map<String, Object>>> getLowStockDistribution() {
        return ResponseEntity.ok(dashboardService.getLowStockDistribution());
    }
}
