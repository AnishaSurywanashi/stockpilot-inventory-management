package com.stockpilot.service;

import com.stockpilot.entity.AuditLog;
import com.stockpilot.repository.AuditLogRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository repo;

    public void record(String action, String entityType, Long entityId, String reason) {
        String user = "SYSTEM";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            user = auth.getName();
        }
        
        repo.save(AuditLog.builder()
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .performedBy(user)
            .reason(reason)
            .timestamp(LocalDateTime.now())
            .build());
    }
}
