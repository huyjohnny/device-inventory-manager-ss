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

    // Get sum of quantities for a warhouse
    public int getCapacityUsed(Long warehouseId) {
        return deviceRepository.sumQuantityByWarehouseId(warehouseId);
    }

    // Updated version: save device with warehouse capacity check
    public Device save(Device device, Long warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        boolean isNewDevice = (device.getId() == null);

        // If updating, load the existing device
        Warehouse oldWarehouse = null;
        if (!isNewDevice) {
            Device existing = deviceRepository.findById(device.getId())
                    .orElseThrow(() -> new RuntimeException("Device not found"));
            oldWarehouse = existing.getWarehouse();
        }

        // New device
        if (isNewDevice) {
            long currentCount = deviceRepository.countByWarehouseId(warehouseId);
            if (currentCount >= warehouse.getCapacity()) {
                throw new RuntimeException("Warehouse is full — cannot add more devices.");
            }
        }

        // Existing device
        if (!isNewDevice && !oldWarehouse.getId().equals(warehouseId)) {

            long currentCount = deviceRepository.countByWarehouseId(warehouseId);
            if (currentCount >= warehouse.getCapacity()) {
                throw new RuntimeException("Warehouse is full — cannot move this device.");
            }
        }

        // Works - assign the new warehouse
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