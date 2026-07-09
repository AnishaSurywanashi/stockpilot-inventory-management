package com.stockpilot.dto.request;

import com.stockpilot.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
    @NotBlank(message = "Username cannot be blank")
    String username,

    @NotBlank(message = "Password cannot be blank")
    String password,

    @NotNull(message = "Role is required")
    Role role
) {}
