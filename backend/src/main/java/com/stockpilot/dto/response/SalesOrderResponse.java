package com.stockpilot.dto.response;

import com.stockpilot.entity.OrderStatus;
import java.time.LocalDateTime;
import java.util.List;

public record SalesOrderResponse(
    Long id,
    String orderNumber,
    OrderStatus status,
    List<SalesOrderItemResponse> items,
    LocalDateTime createdAt
) {}
