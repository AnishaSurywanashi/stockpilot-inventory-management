package com.stockpilot.service;

import com.stockpilot.entity.Notification;
import com.stockpilot.entity.NotificationType;
import com.stockpilot.repository.NotificationRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;

    public void push(NotificationType type, String message) {
        repo.save(Notification.builder()
            .type(type)
            .message(message)
            .read(false)
            .createdAt(LocalDateTime.now())
            .build());
    }

    public List<Notification> unread() {
        return repo.findByReadFalseOrderByCreatedAtDesc();
    }
    
    public void markAsRead(Long id) {
        repo.findById(id).ifPresent(n -> {
            n.setRead(true);
            repo.save(n);
        });
    }
    
    public void markAllAsRead() {
        List<Notification> unread = repo.findByReadFalseOrderByCreatedAtDesc();
        for (Notification n : unread) {
            n.setRead(true);
            repo.save(n);
        }
    }
}
