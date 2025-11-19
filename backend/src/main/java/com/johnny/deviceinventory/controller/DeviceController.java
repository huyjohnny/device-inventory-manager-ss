package com.johnny.deviceinventory.controller;

import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import com.johnny.deviceinventory.entity.Device;
import com.johnny.deviceinventory.entity.Warehouse;
import com.johnny.deviceinventory.service.DeviceService;

@RestController
@RequestMapping("/api/devices")
@CrossOrigin(origins = "http://localhost:3000")
public class DeviceController {
    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @GetMapping
    public List<Device> getAll() {
        return deviceService.getAll();
    }

    @GetMapping("/{id}")
    public Device getById(@PathVariable Long id) {
        return deviceService.getById(id);
    }

    @PostMapping
    public Device create(@RequestParam Long warehouseId, @Valid @RequestBody Device device) {
        return deviceService.save(device, warehouseId);
    }

    @PutMapping("/{id}")
    public Device updateDevice(
            @PathVariable Long id,
            @RequestParam Long warehouseId,
            @Valid @RequestBody Device updatedDevice) {

        // Get the existing device
        Device existing = deviceService.getById(id);
        if (existing == null) {
            throw new RuntimeException("Device not found");
        }

        // Update fields
        existing.setModelName(updatedDevice.getModelName());
        existing.setBrand(updatedDevice.getBrand());
        existing.setCategory(updatedDevice.getCategory());
        existing.setSku(updatedDevice.getSku());
        existing.setQuantity(updatedDevice.getQuantity());
        existing.setDescription(updatedDevice.getDescription());
        existing.setStorageLocation(updatedDevice.getStorageLocation());

        // Update warehouse
        Warehouse warehouse = deviceService.getWarehouseById(warehouseId);
        existing.setWarehouse(warehouse);

        // Save updated device
        return deviceService.saveRaw(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        deviceService.delete(id);
    }
}