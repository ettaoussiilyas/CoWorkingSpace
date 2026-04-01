package com.aihub.backend.controller;

import com.aihub.backend.dto.BookingRequest;
import com.aihub.backend.dto.BookingResponse;
import com.aihub.backend.entity.User;
import com.aihub.backend.service.BookingService;
import com.aihub.backend.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService service;
    private final ExportService exportService;

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(service.getAllBookings());
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/month")
    public ResponseEntity<List<BookingResponse>> getByMonth(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        LocalDate now = LocalDate.now();
        int y = year == 0 ? now.getYear() : year;
        int m = month == 0 ? now.getMonthValue() : month;
        return ResponseEntity.ok(service.getBookingsByMonth(y, m));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/export")
    public ResponseEntity<String> exportBookings(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        LocalDate now = LocalDate.now();
        int y = year == 0 ? now.getYear() : year;
        int m = month == 0 ? now.getMonthValue() : month;
        String monthName = now.withMonth(m).getMonth().name().toLowerCase();
        String filename = "spacehub-bookings-" + y + "-" + monthName + ".csv";
        String csv = exportService.exportMonthCsv(y, m);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(service.updateStatus(id, body.get("status")));
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping
    public ResponseEntity<BookingResponse> create(
            @RequestBody BookingRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.create(request, user.getId()));
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getUserBookings(user.getId()));
    }
}
