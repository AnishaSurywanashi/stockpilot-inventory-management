package com.stockpilot.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ReserveStockRequest(
    @NotNull(message = "Product ID is required")
    Long productId,

    @NotNull(message = "Warehouse ID is required")
    Long warehouseId,

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    Integer quantity,

    @NotNull(message = "Sales Order ID is required")
    Long salesOrderId
) {}
