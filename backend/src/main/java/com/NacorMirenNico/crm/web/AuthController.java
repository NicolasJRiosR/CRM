package com.NacorMirenNico.crm.web;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.NacorMirenNico.crm.dto.LoginRequest;
import com.NacorMirenNico.crm.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService authService, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        System.out.println("=== LOGIN REQUEST RECEIVED ===");
        System.out.println("Username: " + req.getUsername());
        
        try {
            String token = authService.authenticate(req.getUsername(), req.getPassword());
            return ResponseEntity.ok(Map.of("token", token));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Credenciales inválidas"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }

    // ENDPOINT TEMPORAL - ELIMINAR DESPUÉS
    @PostMapping("/generate-hash")
    public ResponseEntity<?> generateHash(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        String hash = passwordEncoder.encode(password);
        
        System.out.println("=== HASH GENERADO ===");
        System.out.println("Password: " + password);
        System.out.println("Hash: " + hash);
        System.out.println("Longitud: " + hash.length());
        
        return ResponseEntity.ok(Map.of(
            "password", password,
            "hash", hash,
            "length", hash.length(),
            "sql", "UPDATE users SET password = '" + hash + "' WHERE username = 'test2';"
        ));
    }
}