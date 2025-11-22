package com.johnny.deviceinventory.controller;

import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import com.johnny.deviceinventory.entity.Warehouse;
import com.johnny.deviceinventory.service.DeviceService;
import com.johnny.deviceinventory.service.WarehouseService;

@RestController
@RequestMapping("/api/warehouses")
@CrossOrigin(origins = "http://localhost:3000")
public class WarehouseController {
    private final WarehouseService warehouseService;
    private final DeviceService deviceService;

    public WarehouseController(WarehouseService warehouseService, DeviceService deviceService) {
        this.warehouseService = warehouseService;
        this.deviceService = deviceService;
    }

    @GetMapping
    public List<Warehouse> getAll() {
        return warehouseService.getAll();
    }

    @GetMapping("/{id}")
    public Warehouse getById(@PathVariable Long id) {
        return warehouseService.getById(id);
    }

    @GetMapping("/{id}/capacityUsed")
    public int getCapacityUsed(@PathVariable Long id) {
        return deviceService.getCapacityUsed(id);
    }

    @PostMapping(consumes = "application/json")
    public Warehouse create(@Valid @RequestBody Warehouse warehouse) {
        return warehouseService.save(warehouse);
    }

    @PutMapping("/{id}")
    public Warehouse update(@PathVariable Long id, @Valid @RequestBody Warehouse warehouse) {
        warehouse.setId(id);
        return warehouseService.save(warehouse);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        warehouseService.delete(id);
    }
}