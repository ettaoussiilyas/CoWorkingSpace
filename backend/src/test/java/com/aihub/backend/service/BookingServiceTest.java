package com.aihub.backend.service;

import com.aihub.backend.dto.BookingRequest;
import com.aihub.backend.dto.BookingResponse;
import com.aihub.backend.entity.*;
import com.aihub.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private SpaceRepository spaceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AvailabilityBlockRepository availabilityBlockRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private BookingService bookingService;

    private BookingRequest bookingRequest;
    private User testUser;
    private Center testCenter;
    private Space testSpace;
    private Booking testBooking;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @BeforeEach
    void setUp() {
        startTime = LocalDateTime.now().plusDays(1);
        endTime = startTime.plusHours(3);

        bookingRequest = BookingRequest.builder()
                .spaceId(1L)
                .startDateTime(startTime)
                .endDateTime(endTime)
                .build();

        testUser = User.builder()
                .id(1L)
                .fullName("Test User")
                .email("test@example.com")
                .role(Role.ROLE_USER)
                .build();

        testCenter = Center.builder()
                .id(1L)
                .name("Test Center")
                .build();

        testSpace = Space.builder()
                .id(1L)
                .name("Test Space")
                .center(testCenter)
                .pricePerHour(new BigDecimal("50.00"))
                .build();

        testBooking = Booking.builder()
                .id(1L)
                .user(testUser)
                .space(testSpace)
                .startDateTime(startTime)
                .endDateTime(endTime)
                .totalPrice(new BigDecimal("150.00"))
                .status(BookingStatus.PENDING)
                .build();
    }

    @Test
    void create_ShouldCreateBooking_WhenNoConflicts() {
        // Arrange
        when(bookingRepository.countOverlappingBookings(anyLong(), any(), any())).thenReturn(0L);
        when(availabilityBlockRepository.findOverlappingBlocks(anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(spaceRepository.findById(anyLong())).thenReturn(Optional.of(testSpace));
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);
        when(reviewRepository.existsByBookingId(anyLong())).thenReturn(false);
        doNothing().when(emailService).sendBookingConfirmation(anyString(), anyString(), anyString());

        // Act
        BookingResponse response = bookingService.create(bookingRequest, 1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getSpaceName()).isEqualTo("Test Space");
        assertThat(response.getCenterName()).isEqualTo("Test Center");
        assertThat(response.getTotalPrice()).isEqualTo(new BigDecimal("150.00"));
        assertThat(response.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(response.isHasReview()).isFalse();

        verify(bookingRepository).countOverlappingBookings(1L, startTime, endTime);
        verify(availabilityBlockRepository).findOverlappingBlocks(1L, startTime, endTime);
        verify(bookingRepository).save(any(Booking.class));
        verify(emailService).sendBookingConfirmation(
                eq("test@example.com"),
                eq("Test Space"),
                anyString()
        );
    }

    @Test
    void create_ShouldThrowException_WhenBookingConflictExists() {
        // Arrange
        when(bookingRepository.countOverlappingBookings(anyLong(), any(), any())).thenReturn(1L);

        // Act & Assert
        assertThatThrownBy(() -> bookingService.create(bookingRequest, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("booking.conflict.existing_booking");

        verify(bookingRepository).countOverlappingBookings(1L, startTime, endTime);
        verify(bookingRepository, never()).save(any(Booking.class));
        verify(emailService, never()).sendBookingConfirmation(anyString(), anyString(), anyString());
    }

    @Test
    void create_ShouldThrowException_WhenMaintenanceBlockExists() {
        // Arrange
        AvailabilityBlock maintenanceBlock = new AvailabilityBlock();
        when(bookingRepository.countOverlappingBookings(anyLong(), any(), any())).thenReturn(0L);
        when(availabilityBlockRepository.findOverlappingBlocks(anyLong(), any(), any()))
                .thenReturn(Arrays.asList(maintenanceBlock));

        // Act & Assert
        assertThatThrownBy(() -> bookingService.create(bookingRequest, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("booking.conflict.maintenance");

        verify(availabilityBlockRepository).findOverlappingBlocks(1L, startTime, endTime);
        verify(bookingRepository, never()).save(any(Booking.class));
        verify(emailService, never()).sendBookingConfirmation(anyString(), anyString(), anyString());
    }

    @Test
    void create_ShouldThrowException_WhenSpaceNotFound() {
        // Arrange
        when(bookingRepository.countOverlappingBookings(anyLong(), any(), any())).thenReturn(0L);
        when(availabilityBlockRepository.findOverlappingBlocks(anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(spaceRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> bookingService.create(bookingRequest, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Space not found");

        verify(spaceRepository).findById(1L);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void create_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        when(bookingRepository.countOverlappingBookings(anyLong(), any(), any())).thenReturn(0L);
        when(availabilityBlockRepository.findOverlappingBlocks(anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(spaceRepository.findById(anyLong())).thenReturn(Optional.of(testSpace));
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> bookingService.create(bookingRequest, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");

        verify(userRepository).findById(1L);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void create_ShouldCalculatePriceCorrectly() {
        // Arrange
        when(bookingRepository.countOverlappingBookings(anyLong(), any(), any())).thenReturn(0L);
        when(availabilityBlockRepository.findOverlappingBlocks(anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(spaceRepository.findById(anyLong())).thenReturn(Optional.of(testSpace));
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            // 3 hours * 50.00 per hour = 150.00
            assertThat(booking.getTotalPrice()).isEqualTo(new BigDecimal("150.00"));
            return testBooking;
        });
        when(reviewRepository.existsByBookingId(anyLong())).thenReturn(false);
        doNothing().when(emailService).sendBookingConfirmation(anyString(), anyString(), anyString());

        // Act
        bookingService.create(bookingRequest, 1L);

        // Assert
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void create_ShouldSetBookingStatusToPending() {
        // Arrange
        when(bookingRepository.countOverlappingBookings(anyLong(), any(), any())).thenReturn(0L);
        when(availabilityBlockRepository.findOverlappingBlocks(anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(spaceRepository.findById(anyLong())).thenReturn(Optional.of(testSpace));
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            assertThat(booking.getStatus()).isEqualTo(BookingStatus.PENDING);
            return testBooking;
        });
        when(reviewRepository.existsByBookingId(anyLong())).thenReturn(false);
        doNothing().when(emailService).sendBookingConfirmation(anyString(), anyString(), anyString());

        // Act
        bookingService.create(bookingRequest, 1L);

        // Assert
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void getUserBookings_ShouldReturnUserBookings() {
        // Arrange
        List<Booking> bookings = Arrays.asList(testBooking);
        when(bookingRepository.findByUserIdOrderByCreatedAtDesc(anyLong())).thenReturn(bookings);
        when(reviewRepository.existsByBookingId(anyLong())).thenReturn(false);

        // Act
        List<BookingResponse> responses = bookingService.getUserBookings(1L);

        // Assert
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getId()).isEqualTo(1L);
        assertThat(responses.get(0).getSpaceName()).isEqualTo("Test Space");
        assertThat(responses.get(0).getCenterName()).isEqualTo("Test Center");

        verify(bookingRepository).findByUserIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void getUserBookings_ShouldReturnEmptyList_WhenNoBookingsFound() {
        // Arrange
        when(bookingRepository.findByUserIdOrderByCreatedAtDesc(anyLong()))
                .thenReturn(Collections.emptyList());

        // Act
        List<BookingResponse> responses = bookingService.getUserBookings(1L);

        // Assert
        assertThat(responses).isEmpty();
        verify(bookingRepository).findByUserIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void getUserBookings_ShouldIncludeReviewStatus() {
        // Arrange
        List<Booking> bookings = Arrays.asList(testBooking);
        when(bookingRepository.findByUserIdOrderByCreatedAtDesc(anyLong())).thenReturn(bookings);
        when(reviewRepository.existsByBookingId(anyLong())).thenReturn(true);

        // Act
        List<BookingResponse> responses = bookingService.getUserBookings(1L);

        // Assert
        assertThat(responses.get(0).isHasReview()).isTrue();
        verify(reviewRepository).existsByBookingId(1L);
    }
}
