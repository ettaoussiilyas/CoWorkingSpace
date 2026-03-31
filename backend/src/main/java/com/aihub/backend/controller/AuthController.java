package com.aihub.backend.controller;

import com.aihub.backend.dto.AuthenticationRequest;
import com.aihub.backend.dto.AuthenticationResponse;
import com.aihub.backend.dto.GoogleAuthRequest;
import com.aihub.backend.dto.RegisterRequest;
import com.aihub.backend.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthenticationResponse> googleAuth(@RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(authenticationService.authenticateWithGoogle(request.getCredential()));
    }
}
