package com.johnny.deviceinventory.service;

import org.springframework.stereotype.Service;
import java.util.List;
import com.johnny.deviceinventory.entity.Device;
import com.johnny.deviceinventory.entity.Warehouse; 
import com.johnny.deviceinventory.repository.DeviceRepository;
import com.johnny.deviceinventory.repository.WarehouseRepository;

@Service
public class DeviceService {
    private final DeviceRepository deviceRepository;
    private final WarehouseRepository warehouseRepository;

    public DeviceService(DeviceRepository deviceRepository, WarehouseRepository warehouseRepository) {
        this.deviceRepository = deviceRepository;
        this.warehouseRepository = warehouseRepository;
    }

    public List<Device> getAll() {
        return deviceRepository.findAll();
    }

    public Device getById(Long id) {
        return deviceRepository.findById(id).orElse(null);
    }

    // Fetch warehouse by id
    public Warehouse getWarehouseById(Long warehouseId) {
        return warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
    }

    // Updated version save func to load warehouse
    public Device save(Device device, Long warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        device.setWarehouse(warehouse);
        return deviceRepository.save(device);
    }

    public Device saveRaw(Device device) {
        return deviceRepository.save(device);
    }

    public void delete(Long id) {
        deviceRepository.deleteById(id);
    }
}