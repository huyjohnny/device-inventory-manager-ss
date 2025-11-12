package com.johnny.deviceinventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.johnny.deviceinventory.entity.Device;

public interface DeviceRepository extends JpaRepository<Device, Long> {
    
}
