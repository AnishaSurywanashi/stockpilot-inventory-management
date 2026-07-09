package com.stockpilot.dto.response;

import java.math.BigDecimal;

public record SalesOrderItemResponse(
    Long id,
    Long productId,
    String productName,
    Integer quantity,
    BigDecimal unitPrice
) {}
