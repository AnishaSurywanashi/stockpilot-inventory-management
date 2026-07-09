package com.stockpilot.service;

import com.stockpilot.dto.request.WarehouseRequest;
import com.stockpilot.dto.response.WarehouseResponse;
import com.stockpilot.entity.Warehouse;
import com.stockpilot.exception.NotFoundException;
import com.stockpilot.repository.WarehouseRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepo;
    private final AuditLogService auditLog;

    public List<WarehouseResponse> findAll() {
        return warehouseRepo.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public WarehouseResponse findById(Long id) {
        return warehouseRepo.findById(id)
            .map(this::mapToResponse)
            .orElseThrow(() -> new NotFoundException("Warehouse not found"));
    }

    @Transactional
    public WarehouseResponse create(WarehouseRequest req) {
        if (warehouseRepo.findByCode(req.code()).isPresent()) {
            throw new IllegalArgumentException("Warehouse code already exists");
        }
        
        Warehouse w = Warehouse.builder()
            .code(req.code())
            .name(req.name())
            .city(req.city())
            .build();
            
        Warehouse saved = warehouseRepo.save(w);
        auditLog.record("CREATE", "Warehouse", saved.getId(), "Created warehouse: " + saved.getName() + " (" + saved.getCode() + ")");
        return mapToResponse(saved);
    }

    @Transactional
    public WarehouseResponse update(Long id, WarehouseRequest req) {
        Warehouse w = warehouseRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Warehouse not found"));
            
        w.setCode(req.code());
        w.setName(req.name());
        w.setCity(req.city());
        
        Warehouse saved = warehouseRepo.save(w);
        auditLog.record("UPDATE", "Warehouse", saved.getId(), "Updated warehouse: " + saved.getName());
        return mapToResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Warehouse w = warehouseRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Warehouse not found"));
        warehouseRepo.delete(w);
        auditLog.record("DELETE", "Warehouse", id, "Deleted warehouse: " + w.getName());
    }

    private WarehouseResponse mapToResponse(Warehouse w) {
        return new WarehouseResponse(
            w.getId(),
            w.getCode(),
            w.getName(),
            w.getCity()
        );
    }
}
