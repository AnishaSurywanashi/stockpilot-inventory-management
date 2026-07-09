package com.stockpilot.dto.response;

import java.time.LocalDateTime;

public record AuditLogResponse(
    Long id,
    String action,
    String entityType,
    Long entityId,
    String performedBy,
    String reason,
    LocalDateTime timestamp
) {}
