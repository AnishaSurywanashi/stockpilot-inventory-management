package com.stockpilot.dto.response;

import com.stockpilot.entity.OrderStatus;
import java.time.LocalDateTime;
import java.util.List;

public record PurchaseOrderResponse(
    Long id,
    String orderNumber,
    Long supplierId,
    String supplierName,
    Long warehouseId,
    String warehouseName,
    OrderStatus status,
    List<PurchaseOrderItemResponse> items,
    LocalDateTime createdAt
) {}
