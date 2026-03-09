package com.aihub.backend.service;

import com.aihub.backend.dto.ReviewRequest;
import com.aihub.backend.dto.ReviewResponse;
import com.aihub.backend.entity.Booking;
import com.aihub.backend.entity.Review;
import com.aihub.backend.entity.Space;
import com.aihub.backend.entity.User;
import com.aihub.backend.repository.BookingRepository;
import com.aihub.backend.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User testUser;
    private Space testSpace;
    private Booking testBooking;
    private Review testReview;
    private ReviewRequest reviewRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .fullName("John Doe")
                .email("john@example.com")
                .build();

        testSpace = Space.builder()
                .id(1L)
                .name("Test Space")
                .build();

        testBooking = Booking.builder()
                .id(1L)
                .user(testUser)
                .space(testSpace)
                .build();

        testReview = Review.builder()
                .id(1L)
                .user(testUser)
                .space(testSpace)
                .booking(testBooking)
                .rating(5)
                .comment("Great space!")
                .build();

        reviewRequest = ReviewRequest.builder()
                .bookingId(1L)
                .rating(5)
                .comment("Great space!")
                .build();
    }

    @Test
    void createReview_ShouldCreateReview_WhenValidRequest() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(reviewRepository.existsByBookingId(1L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenReturn(testReview);

        // Act
        ReviewResponse response = reviewService.createReview(reviewRequest, 1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getRating()).isEqualTo(5);
        assertThat(response.getComment()).isEqualTo("Great space!");
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void createReview_ShouldThrowException_WhenBookingNotFound() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> reviewService.createReview(reviewRequest, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Booking not found");
    }

    @Test
    void createReview_ShouldThrowException_WhenUnauthorized() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act & Assert
        assertThatThrownBy(() -> reviewService.createReview(reviewRequest, 2L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Unauthorized: You can only review your own bookings");
    }

    @Test
    void createReview_ShouldThrowException_WhenReviewAlreadyExists() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(reviewRepository.existsByBookingId(1L)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> reviewService.createReview(reviewRequest, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Review already exists for this booking");
    }

    @Test
    void getReviewsBySpace_ShouldReturnReviews() {
        // Arrange
        when(reviewRepository.findBySpaceIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(testReview));

        // Act
        List<ReviewResponse> responses = reviewService.getReviewsBySpace(1L);

        // Assert
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getRating()).isEqualTo(5);
    }

    @Test
    void reportReview_ShouldReportReview() {
        // Arrange
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(testReview));
        when(reviewRepository.save(any(Review.class))).thenReturn(testReview);

        // Act
        reviewService.reportReview(1L);

        // Assert
        assertThat(testReview.getReported()).isTrue();
        verify(reviewRepository).save(testReview);
    }

    @Test
    void reportReview_ShouldThrowException_WhenReviewNotFound() {
        // Arrange
        when(reviewRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> reviewService.reportReview(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Review not found");
    }

    @Test
    void deleteReview_ShouldDeleteReview() {
        // Act
        reviewService.deleteReview(1L);

        // Assert
        verify(reviewRepository).deleteById(1L);
    }
}
