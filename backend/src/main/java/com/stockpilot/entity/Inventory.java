package com.stockpilot.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(uniqueConstraints = @UniqueConstraint(
        columnNames = {"product_id", "warehouse_id"}))
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Product product;

    @ManyToOne(optional = false)
    private Warehouse warehouse;

    @Builder.Default
    private Integer quantityOnHand = 0;

    @Builder.Default
    private Integer quantityReserved = 0;

    @Version
    private Long version;

    @Transient
    public int getAvailable() {
        return (quantityOnHand != null ? quantityOnHand : 0) - (quantityReserved != null ? quantityReserved : 0);
    }
}
