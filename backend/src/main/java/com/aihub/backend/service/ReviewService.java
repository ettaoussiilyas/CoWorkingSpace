package com.aihub.backend.service;

import com.aihub.backend.dto.ReviewRequest;
import com.aihub.backend.dto.ReviewResponse;
import com.aihub.backend.entity.Booking;
import com.aihub.backend.entity.Review;
import com.aihub.backend.repository.BookingRepository;
import com.aihub.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository repository;
    private final BookingRepository bookingRepository;

    @Transactional
    public ReviewResponse createReview(ReviewRequest request, Long userId) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only review your own bookings");
        }

        if (repository.existsByBookingId(request.getBookingId())) {
            throw new RuntimeException("Review already exists for this booking");
        }

        Review review = Review.builder()
                .user(booking.getUser())
                .space(booking.getSpace())
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return mapToResponse(repository.save(review));
    }

    public List<ReviewResponse> getReviewsBySpace(Long spaceId) {
        return repository.findBySpaceIdOrderByCreatedAtDesc(spaceId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void reportReview(Long id) {
        Review review = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setReported(true);
        repository.save(review);
    }

    @Transactional
    public void deleteReview(Long id) {
        repository.deleteById(id);
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userName(review.getUser().getFullName())
                .spaceName(review.getSpace().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .reported(review.getReported())
                .build();
    }
}
