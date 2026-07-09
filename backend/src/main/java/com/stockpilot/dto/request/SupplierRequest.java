package com.stockpilot.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SupplierRequest(
    @NotBlank(message = "Supplier name cannot be blank")
    String name,

    @Email(message = "Invalid email format")
    String email,

    String phone
) {}
