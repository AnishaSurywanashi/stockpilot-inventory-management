package com.stockpilot.service;

import com.stockpilot.dto.request.SupplierRequest;
import com.stockpilot.dto.response.SupplierResponse;
import com.stockpilot.entity.Supplier;
import com.stockpilot.exception.NotFoundException;
import com.stockpilot.repository.SupplierRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepo;
    private final AuditLogService auditLog;

    public List<SupplierResponse> findAll() {
        return supplierRepo.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public SupplierResponse findById(Long id) {
        return supplierRepo.findById(id)
            .map(this::mapToResponse)
            .orElseThrow(() -> new NotFoundException("Supplier not found"));
    }

    @Transactional
    public SupplierResponse create(SupplierRequest req) {
        Supplier s = Supplier.builder()
            .name(req.name())
            .email(req.email())
            .phone(req.phone())
            .build();
            
        Supplier saved = supplierRepo.save(s);
        auditLog.record("CREATE", "Supplier", saved.getId(), "Created supplier: " + saved.getName());
        return mapToResponse(saved);
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierRequest req) {
        Supplier s = supplierRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Supplier not found"));
            
        s.setName(req.name());
        s.setEmail(req.email());
        s.setPhone(req.phone());
        
        Supplier saved = supplierRepo.save(s);
        auditLog.record("UPDATE", "Supplier", saved.getId(), "Updated supplier: " + saved.getName());
        return mapToResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Supplier s = supplierRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Supplier not found"));
        supplierRepo.delete(s);
        auditLog.record("DELETE", "Supplier", id, "Deleted supplier: " + s.getName());
    }

    private SupplierResponse mapToResponse(Supplier s) {
        return new SupplierResponse(
            s.getId(),
            s.getName(),
            s.getEmail(),
            s.getPhone()
        );
    }
}
