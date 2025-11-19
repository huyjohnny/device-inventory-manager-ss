package com.johnny.deviceinventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.johnny.deviceinventory.entity.Device;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

public interface DeviceRepository extends JpaRepository<Device, Long> {
    long countByWarehouseId(Long warehouseId);

    // Sum quantities
    @Query("SELECT COALESCE(SUM(d.quantity), 0) FROM Device d WHERE d.warehouse.id = :warehouseId")
    int sumQuantityByWarehouseId(@Param("warehouseId") Long warehouseId);
}
