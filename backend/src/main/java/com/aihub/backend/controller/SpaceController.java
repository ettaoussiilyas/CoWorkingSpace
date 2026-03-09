package com.aihub.backend.controller;

import com.aihub.backend.dto.SpaceRequest;
import com.aihub.backend.dto.SpaceResponse;
import com.aihub.backend.service.SpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SpaceController {

    private final SpaceService service;

    @GetMapping("/center/{centerId}")
    public ResponseEntity<List<SpaceResponse>> getByCenter(@PathVariable Long centerId) {
        return ResponseEntity.ok(service.getAllByCenter(centerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpaceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<SpaceResponse> create(@RequestBody SpaceRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SpaceResponse> update(@PathVariable Long id, @RequestBody SpaceRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
