package com.stockpilot.controller;

import com.stockpilot.dto.request.PurchaseOrderRequest;
import com.stockpilot.dto.response.PurchaseOrderResponse;
import com.stockpilot.service.PurchaseOrderService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponse>> findAll() {
        return ResponseEntity.ok(purchaseOrderService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderResponse> create(@Valid @RequestBody PurchaseOrderRequest req) {
        return ResponseEntity.ok(purchaseOrderService.create(req));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Void> confirmOrder(@PathVariable Long id) {
        purchaseOrderService.confirmOrder(id);
        return ResponseEntity.ok().build();
    }
}
