package com.stockpilot.config;

import com.stockpilot.entity.Product;
import com.stockpilot.entity.Warehouse;
import com.stockpilot.entity.Supplier;
import com.stockpilot.entity.User;
import com.stockpilot.entity.Role;
import com.stockpilot.entity.Inventory;
import com.stockpilot.repository.ProductRepository;
import com.stockpilot.repository.WarehouseRepository;
import com.stockpilot.repository.SupplierRepository;
import com.stockpilot.repository.UserRepository;
import com.stockpilot.repository.InventoryRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed Users
        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                .username("admin")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .build());

            userRepository.save(User.builder()
                .username("staff")
                .passwordHash(passwordEncoder.encode("staff123"))
                .role(Role.STAFF)
                .build());
        }

        // Seed Warehouses
        Warehouse wh1 = null;
        Warehouse wh2 = null;
        if (warehouseRepository.count() == 0) {
            wh1 = warehouseRepository.save(Warehouse.builder()
                .code("WH-001")
                .name("Seattle Main Logistics")
                .city("Seattle")
                .build());

            wh2 = warehouseRepository.save(Warehouse.builder()
                .code("WH-002")
                .name("Boston Distribution")
                .city("Boston")
                .build());
        } else {
            wh1 = warehouseRepository.findAll().get(0);
            if (warehouseRepository.count() > 1) {
                wh2 = warehouseRepository.findAll().get(1);
            }
        }

        // Seed Suppliers
        Supplier s1 = null;
        if (supplierRepository.count() == 0) {
            s1 = supplierRepository.save(Supplier.builder()
                .name("TechNexus Corp")
                .email("orders@technexus.com")
                .phone("+1-555-0100")
                .build());
            
            supplierRepository.save(Supplier.builder()
                .name("Apex Raw Materials")
                .email("sales@apexraw.com")
                .phone("+1-555-0255")
                .build());
        }

        // Seed Products
        Product p1 = null;
        Product p2 = null;
        if (productRepository.count() == 0) {
            p1 = productRepository.save(Product.builder()
                .sku("SKU-PROB-LAP")
                .name("StockPilot ProBook Laptop")
                .category("Electronics")
                .unitPrice(BigDecimal.valueOf(1199.99))
                .lowStockThreshold(5)
                .build());

            p2 = productRepository.save(Product.builder()
                .sku("SKU-VELO-PHN")
                .name("StockPilot Velo Smartphone")
                .category("Mobile Devices")
                .unitPrice(BigDecimal.valueOf(799.49))
                .lowStockThreshold(8)
                .build());
        } else {
            p1 = productRepository.findAll().get(0);
            if (productRepository.count() > 1) {
                p2 = productRepository.findAll().get(1);
            }
        }

        // Seed Initial Inventory records
        if (inventoryRepository.count() == 0 && wh1 != null && p1 != null && p2 != null) {
            inventoryRepository.save(Inventory.builder()
                .product(p1)
                .warehouse(wh1)
                .quantityOnHand(25)
                .quantityReserved(0)
                .build());

            inventoryRepository.save(Inventory.builder()
                .product(p2)
                .warehouse(wh1)
                .quantityOnHand(4) // deliberately low to trigger alert!
                .quantityReserved(0)
                .build());

            if (wh2 != null) {
                inventoryRepository.save(Inventory.builder()
                    .product(p1)
                    .warehouse(wh2)
                    .quantityOnHand(12)
                    .quantityReserved(0)
                    .build());
            }
        }
    }
}
