package com.stockpilot.dto.response;

public record InventoryResponse(
    Long id,
    Long productId,
    String productName,
    Long warehouseId,
    String warehouseName,
    int onHand,
    int reserved,
    int available
) {}
