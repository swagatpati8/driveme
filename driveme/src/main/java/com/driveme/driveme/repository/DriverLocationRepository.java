package com.driveme.driveme.repository;

import com.driveme.driveme.model.DriverLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverLocationRepository extends JpaRepository<DriverLocation, Long> {
}
