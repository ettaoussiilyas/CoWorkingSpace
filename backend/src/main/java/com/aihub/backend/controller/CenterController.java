package com.aihub.backend.controller;

import com.aihub.backend.dto.CenterRequest;
import com.aihub.backend.dto.CenterResponse;
import com.aihub.backend.service.CenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/centers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CenterController {

    private final CenterService service;

    @GetMapping
    public ResponseEntity<List<CenterResponse>> getAll() {
        return ResponseEntity.ok(service.getAllActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CenterResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<CenterResponse> create(
            @RequestPart("center") CenterRequest request,
            @RequestPart("image") MultipartFile image
    ) throws IOException {
        return ResponseEntity.ok(service.create(request, image));
    }
}
