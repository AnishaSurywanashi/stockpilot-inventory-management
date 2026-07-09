package com.stockpilot.controller;

import com.stockpilot.dto.request.StockTransferRequest;
import com.stockpilot.dto.response.StockTransferItemResponse;
import com.stockpilot.dto.response.StockTransferResponse;
import com.stockpilot.entity.Product;
import com.stockpilot.entity.StockTransfer;
import com.stockpilot.entity.StockTransferItem;
import com.stockpilot.entity.Warehouse;
import com.stockpilot.exception.NotFoundException;
import com.stockpilot.repository.ProductRepository;
import com.stockpilot.repository.WarehouseRepository;
import com.stockpilot.service.StockTransferService;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class StockTransferController {

    private final StockTransferService transferService;
    private final WarehouseRepository warehouseRepo;
    private final ProductRepository productRepo;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StockTransferResponse> transfer(@Valid @RequestBody StockTransferRequest req) {
        Warehouse from = warehouseRepo.findById(req.fromWarehouseId())
            .orElseThrow(() -> new NotFoundException("Source warehouse not found"));
            
        Warehouse to = warehouseRepo.findById(req.toWarehouseId())
            .orElseThrow(() -> new NotFoundException("Destination warehouse not found"));

        StockTransfer transfer = StockTransfer.builder()
            .fromWarehouse(from)
            .toWarehouse(to)
            .items(new ArrayList<>())
            .build();

        for (var itemReq : req.items()) {
            Product p = productRepo.findById(itemReq.productId())
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + itemReq.productId()));
                
            StockTransferItem item = StockTransferItem.builder()
                .stockTransfer(transfer)
                .product(p)
                .quantity(itemReq.quantity())
                .build();
                
            transfer.getItems().add(item);
        }

        StockTransfer completed = transferService.transfer(transfer);
        return ResponseEntity.ok(mapToResponse(completed));
    }

    private StockTransferResponse mapToResponse(StockTransfer t) {
        var itemsR = t.getItems().stream()
            .map(item -> new StockTransferItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity()
            ))
            .collect(Collectors.toList());

        return new StockTransferResponse(
            t.getId(),
            t.getFromWarehouse().getId(),
            t.getFromWarehouse().getName(),
            t.getToWarehouse().getId(),
            t.getToWarehouse().getName(),
            t.getStatus(),
            itemsR,
            t.getCreatedAt()
        );
    }
}
