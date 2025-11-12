package com.johnny.deviceinventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.johnny.deviceinventory.entity.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    
}