package com.stockpilot.service;

import com.stockpilot.dto.request.ProductRequest;
import com.stockpilot.dto.response.ProductResponse;
import com.stockpilot.entity.Product;
import com.stockpilot.exception.NotFoundException;
import com.stockpilot.repository.ProductRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepo;
    private final AuditLogService auditLog;

    public List<ProductResponse> findAll() {
        return productRepo.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public ProductResponse findById(Long id) {
        return productRepo.findById(id)
            .map(this::mapToResponse)
            .orElseThrow(() -> new NotFoundException("Product not found with id: " + id));
    }

    public ProductResponse findBySku(String sku) {
        return productRepo.findBySku(sku)
            .map(this::mapToResponse)
            .orElseThrow(() -> new NotFoundException("Product not found with SKU: " + sku));
    }

    public List<ProductResponse> findByCategory(String category) {
        return productRepo.findByCategory(category).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse create(ProductRequest req) {
        if (productRepo.findBySku(req.sku()).isPresent()) {
            throw new IllegalArgumentException("Product SKU already exists");
        }
        
        Product p = Product.builder()
            .sku(req.sku())
            .name(req.name())
            .category(req.category())
            .unitPrice(req.unitPrice())
            .lowStockThreshold(req.lowStockThreshold())
            .build();
            
        Product saved = productRepo.save(p);
        auditLog.record("CREATE", "Product", saved.getId(), "Created product " + saved.getName() + " with SKU: " + saved.getSku());
        return mapToResponse(saved);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = productRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Product not found"));
            
        p.setSku(req.sku());
        p.setName(req.name());
        p.setCategory(req.category());
        p.setUnitPrice(req.unitPrice());
        p.setLowStockThreshold(req.lowStockThreshold());
        
        Product saved = productRepo.save(p);
        auditLog.record("UPDATE", "Product", saved.getId(), "Updated product details");
        return mapToResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Product p = productRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Product not found"));
        productRepo.delete(p);
        auditLog.record("DELETE", "Product", id, "Deleted product: " + p.getName());
    }

    private ProductResponse mapToResponse(Product p) {
        return new ProductResponse(
            p.getId(),
            p.getSku(),
            p.getName(),
            p.getCategory(),
            p.getUnitPrice(),
            p.getLowStockThreshold()
        );
    }
}
