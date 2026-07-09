package com.stockpilot.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record StockTransferRequest(
    @NotNull(message = "Source warehouse ID is required")
    Long fromWarehouseId,

    @NotNull(message = "Destination warehouse ID is required")
    Long toWarehouseId,

    @NotEmpty(message = "Transfer must contain at least one item")
    List<StockTransferItemRequest> items
) {}
