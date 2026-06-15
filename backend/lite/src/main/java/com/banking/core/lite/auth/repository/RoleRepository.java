package com.banking.core.lite.auth.repository;

import com.banking.core.lite.auth.entity.Role;
import com.banking.core.lite.auth.entity.RoleName;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
