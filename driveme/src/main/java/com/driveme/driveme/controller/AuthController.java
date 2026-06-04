package com.driveme.driveme.controller;

import com.driveme.driveme.model.User;
import com.driveme.driveme.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name = body.get("name");
        String password = body.get("password");
        String roleStr = body.get("role");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword(password);
        user.setRole(User.Role.valueOf(roleStr));

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().toString()
        ));
    }
}
