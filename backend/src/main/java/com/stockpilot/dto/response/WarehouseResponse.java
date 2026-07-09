package com.stockpilot.dto.response;

public record WarehouseResponse(
    Long id,
    String code,
    String name,
    String city
) {}
