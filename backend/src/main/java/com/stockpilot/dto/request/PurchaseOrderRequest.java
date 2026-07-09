package com.stockpilot.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PurchaseOrderRequest(
    @NotBlank(message = "Order number cannot be blank")
    String orderNumber,

    @NotNull(message = "Supplier ID is required")
    Long supplierId,

    @NotNull(message = "Warehouse ID is required")
    Long warehouseId,

    @NotEmpty(message = "Order must contain at least one item")
    List<PurchaseOrderItemRequest> items
) {}
