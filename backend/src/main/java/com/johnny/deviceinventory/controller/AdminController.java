package com.johnny.deviceinventory.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.johnny.deviceinventory.entity.Admin;
import com.johnny.deviceinventory.service.AdminService;

@RestController
@RequestMapping("/api/admins")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public List<Admin> getAll() {
        return adminService.getAll();
    }

    @GetMapping("/{id}")
    public Admin getById(@PathVariable Long id) {
        return adminService.getById(id);
    }

    @PostMapping
    public Admin create(@RequestBody Admin admin) {
        return adminService.save(admin);
    }

    @PutMapping("/{id}")
    public Admin update(@PathVariable Long id, @RequestBody Admin admin) {
        admin.setId(id);
        return adminService.save(admin);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        adminService.delete(id);
    }
}