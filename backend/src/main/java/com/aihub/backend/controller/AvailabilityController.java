package com.aihub.backend.controller;

import com.aihub.backend.dto.AvailabilityResponse;
import com.aihub.backend.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AvailabilityController {

    private final AvailabilityService service;

    @GetMapping("/{spaceId}")
    public ResponseEntity<List<AvailabilityResponse>> getAvailability(
            @PathVariable Long spaceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(service.getBusySlots(spaceId, date));
    }
}
