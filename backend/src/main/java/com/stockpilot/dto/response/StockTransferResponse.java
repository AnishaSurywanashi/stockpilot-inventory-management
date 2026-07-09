package com.stockpilot.dto.response;

import com.stockpilot.entity.TransferStatus;
import java.time.LocalDateTime;
import java.util.List;

public record StockTransferResponse(
    Long id,
    Long fromWarehouseId,
    String fromWarehouseName,
    Long toWarehouseId,
    String toWarehouseName,
    TransferStatus status,
    List<StockTransferItemResponse> items,
    LocalDateTime createdAt
) {}
