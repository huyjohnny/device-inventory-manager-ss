package com.johnny.deviceinventory.service;

import org.springframework.stereotype.Service;
import java.util.List;
import com.johnny.deviceinventory.entity.Device;
import com.johnny.deviceinventory.repository.DeviceRepository;

@Service
public class DeviceService {
    private final DeviceRepository deviceRepository;

    public DeviceService(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    public List<Device> getAll() {
        return deviceRepository.findAll();
    }

    public Device getById(Long id) {
        return deviceRepository.findById(id).orElse(null);
    }

    public Device save(Device device) {
        return deviceRepository.save(device);
    }

    public void delete(Long id) {
        deviceRepository.deleteById(id);
    }
}