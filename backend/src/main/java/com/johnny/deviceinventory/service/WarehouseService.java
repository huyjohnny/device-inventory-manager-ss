package com.johnny.deviceinventory.service;

import org.springframework.stereotype.Service;
import java.util.List;

import com.johnny.deviceinventory.entity.Device;
import com.johnny.deviceinventory.entity.Warehouse;
import com.johnny.deviceinventory.repository.WarehouseRepository;

@Service
public class WarehouseService {
    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    public List<Warehouse> getAll() {
        return warehouseRepository.findAll();
    }

    public Warehouse getById(Long id) {
        return warehouseRepository.findById(id).orElse(null);
    }

    public Warehouse save(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    public void delete(Long id) {
        warehouseRepository.deleteById(id);
    }

    // Get total devices amount stored in warehouse
    public int getUsedCapacity(Long warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        return warehouse.getDevices()
                .stream()
                .mapToInt(Device::getQuantity)
                .sum();
    }

}
