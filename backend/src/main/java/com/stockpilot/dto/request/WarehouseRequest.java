package com.stockpilot.dto.request;

import jakarta.validation.constraints.NotBlank;

public record WarehouseRequest(
    @NotBlank(message = "Warehouse code cannot be blank")
    String code,

    @NotBlank(message = "Warehouse name cannot be blank")
    String name,

    @NotBlank(message = "City cannot be blank")
    String city
) {}
