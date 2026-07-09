package com.stockpilot.service;

import com.stockpilot.dto.response.InventoryResponse;
import com.stockpilot.entity.Inventory;
import com.stockpilot.repository.InventoryRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepo;

    public List<InventoryResponse> findAll() {
        return inventoryRepo.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    private InventoryResponse mapToResponse(Inventory inv) {
        return new InventoryResponse(
            inv.getId(),
            inv.getProduct().getId(),
            inv.getProduct().getName(),
            inv.getWarehouse().getId(),
            inv.getWarehouse().getName(),
            inv.getQuantityOnHand(),
            inv.getQuantityReserved(),
            inv.getAvailable()
        );
    }
}
