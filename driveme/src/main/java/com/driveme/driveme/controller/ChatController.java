package com.driveme.driveme.controller;

import com.driveme.driveme.service.BedrockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    private final BedrockService bedrockService;

    public ChatController(BedrockService bedrockService) {
        this.bedrockService = bedrockService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        String reply = bedrockService.chat(userMessage);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
