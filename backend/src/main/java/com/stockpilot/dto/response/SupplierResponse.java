package com.stockpilot.dto.response;

public record SupplierResponse(
    Long id,
    String name,
    String email,
    String phone
) {}
