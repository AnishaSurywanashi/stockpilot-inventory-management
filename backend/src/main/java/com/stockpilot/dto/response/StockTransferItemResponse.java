package com.stockpilot.dto.response;

public record StockTransferItemResponse(
    Long id,
    Long productId,
    String productName,
    Integer quantity
) {}
