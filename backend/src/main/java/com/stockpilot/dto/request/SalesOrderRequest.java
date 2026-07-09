package com.stockpilot.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record SalesOrderRequest(
    @NotBlank(message = "Order number cannot be blank")
    String orderNumber,

    @NotEmpty(message = "Order must contain at least one item")
    List<SalesOrderItemRequest> items
) {}
