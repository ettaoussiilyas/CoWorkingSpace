package com.aihub.backend.controller;

import com.aihub.backend.dto.ReviewRequest;
import com.aihub.backend.dto.ReviewResponse;
import com.aihub.backend.entity.User;
import com.aihub.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService service;

    @PostMapping
    public ResponseEntity<ReviewResponse> create(
            @RequestBody ReviewRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(service.createReview(request, user.getId()));
    }

    @GetMapping("/space/{spaceId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsBySpace(@PathVariable Long spaceId) {
        return ResponseEntity.ok(service.getReviewsBySpace(spaceId));
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<Void> report(@PathVariable Long id) {
        service.reportReview(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
