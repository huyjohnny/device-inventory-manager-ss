package com.johnny.deviceinventory.service;

import org.springframework.stereotype.Service;
import java.util.List;
import com.johnny.deviceinventory.entity.Admin;
import com.johnny.deviceinventory.repository.AdminRepository;

@Service
public class AdminService {
    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public List<Admin> getAll() {
        return adminRepository.findAll();
    }

    public Admin getById(Long id) {
        return adminRepository.findById(id).orElse(null);
    }

    public Admin save(Admin admin) {
        return adminRepository.save(admin);
    }

    public void delete(Long id) {
        adminRepository.deleteById(id);
    }
}