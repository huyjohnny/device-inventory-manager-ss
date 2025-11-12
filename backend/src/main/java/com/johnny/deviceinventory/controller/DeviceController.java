package com.johnny.deviceinventory.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.johnny.deviceinventory.entity.Device;
import com.johnny.deviceinventory.service.DeviceService;

@RestController
@RequestMapping("/api/devices")
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
    public Device create(@RequestBody Device device) {
        return deviceService.save(device);
    }

    @PutMapping("/{id}")
    public Device update(@PathVariable Long id, @RequestBody Device device) {
        device.setId(id);
        return deviceService.save(device);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        deviceService.delete(id);
    }
}