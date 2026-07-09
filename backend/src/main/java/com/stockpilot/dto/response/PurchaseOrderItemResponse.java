package com.stockpilot.dto.response;

import java.math.BigDecimal;

public record PurchaseOrderItemResponse(
    Long id,
    Long productId,
    String productName,
    Integer quantity,
    BigDecimal unitPrice
) {}
