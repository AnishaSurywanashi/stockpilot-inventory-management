package com.stockpilot.dto.response;

import com.stockpilot.entity.NotificationType;
import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    NotificationType type,
    String message,
    boolean read,
    LocalDateTime createdAt
) {}
