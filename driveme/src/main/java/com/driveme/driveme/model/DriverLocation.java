package com.driveme.driveme.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "driver_locations")
@Data
public class DriverLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(nullable = false)
    private String city;
}
