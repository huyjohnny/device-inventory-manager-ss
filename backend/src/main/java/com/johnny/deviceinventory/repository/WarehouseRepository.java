package com.johnny.deviceinventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.johnny.deviceinventory.entity.Warehouse;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    
}
