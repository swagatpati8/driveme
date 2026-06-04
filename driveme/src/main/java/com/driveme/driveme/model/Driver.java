package com.driveme.driveme.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "drivers")
@Data
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column
    private String phoneNumber;

    @Column
    private String vehicleModel;

    @Column
    private Double pricePerMile;

    @Column(nullable = false)
    private Boolean available = false;

    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DriverLocation> locations = new ArrayList<>();
}
