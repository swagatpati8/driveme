package com.driveme.driveme.controller;

import com.driveme.driveme.model.Driver;
import com.driveme.driveme.model.DriverLocation;
import com.driveme.driveme.model.User;
import com.driveme.driveme.repository.DriverLocationRepository;
import com.driveme.driveme.repository.DriverRepository;
import com.driveme.driveme.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/driver")
@CrossOrigin(origins = "http://localhost:3000")
public class DriverController {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final DriverLocationRepository locationRepository;

    public DriverController(DriverRepository driverRepository, UserRepository userRepository,
                            DriverLocationRepository locationRepository) {
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
    }

    @PostMapping("/profile")
    public ResponseEntity<Map<String, String>> saveProfile(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();

        Driver driver = driverRepository.findByUser(user).orElse(new Driver());
        driver.setUser(user);
        driver.setPhoneNumber(body.get("phoneNumber"));
        driver.setVehicleModel(body.get("vehicleModel"));
        driver.setPricePerMile(Double.parseDouble(body.get("pricePerMile")));

        driverRepository.save(driver);
        return ResponseEntity.ok(Map.of("message", "Profile saved"));
    }

    @PostMapping("/location")
    public ResponseEntity<Map<String, String>> addLocation(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        Driver driver = driverRepository.findByUser(userOpt.get())
                .orElseThrow(() -> new RuntimeException("Driver profile not found"));

        DriverLocation location = new DriverLocation();
        location.setDriver(driver);
        location.setCity(body.get("city"));
        locationRepository.save(location);

        return ResponseEntity.ok(Map.of("message", "Location added"));
    }

    @DeleteMapping("/location/{id}")
    public ResponseEntity<Map<String, String>> removeLocation(@PathVariable Long id) {
        locationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Location removed"));
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, String>> toggleAvailable(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Driver driver = driverRepository.findByUser(
                userRepository.findByEmail(email).orElseThrow()
        ).orElseThrow();

        driver.setAvailable(!driver.getAvailable());
        driverRepository.save(driver);

        return ResponseEntity.ok(Map.of("available", driver.getAvailable().toString()));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found");

        Optional<Driver> driverOpt = driverRepository.findByUser(userOpt.get());
        if (driverOpt.isEmpty()) return ResponseEntity.ok(Map.of("exists", false));

        Driver d = driverOpt.get();
        return ResponseEntity.ok(Map.of(
                "exists", true,
                "phoneNumber", d.getPhoneNumber() != null ? d.getPhoneNumber() : "",
                "vehicleModel", d.getVehicleModel() != null ? d.getVehicleModel() : "",
                "pricePerMile", d.getPricePerMile() != null ? d.getPricePerMile().toString() : "",
                "available", d.getAvailable().toString(),
                "locations", d.getLocations().stream().map(l -> Map.of("id", l.getId(), "city", l.getCity())).toList()
        ));
    }
}
