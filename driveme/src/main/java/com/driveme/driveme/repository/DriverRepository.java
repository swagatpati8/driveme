package com.driveme.driveme.repository;

import com.driveme.driveme.model.Driver;
import com.driveme.driveme.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    List<Driver> findByAvailableTrue();
    Optional<Driver> findByUser(User user);
}
