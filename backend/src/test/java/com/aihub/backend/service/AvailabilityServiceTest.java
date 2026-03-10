package com.aihub.backend.service;

import com.aihub.backend.dto.AvailabilityResponse;
import com.aihub.backend.entity.*;
import com.aihub.backend.repository.AvailabilityBlockRepository;
import com.aihub.backend.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private AvailabilityBlockRepository blockRepository;

    @InjectMocks
    private AvailabilityService availabilityService;

    private Space testSpace;
    private Booking testBooking;
    private AvailabilityBlock testBlock;

    @BeforeEach
    void setUp() {
        testSpace = Space.builder()
                .id(1L)
                .name("Test Space")
                .build();

        testBooking = Booking.builder()
                .id(1L)
                .space(testSpace)
                .startDateTime(LocalDateTime.of(2026, 3, 25, 10, 0))
                .endDateTime(LocalDateTime.of(2026, 3, 25, 12, 0))
                .status(BookingStatus.CONFIRMED)
                .build();

        testBlock = AvailabilityBlock.builder()
                .id(1L)
                .space(testSpace)
                .startDateTime(LocalDateTime.of(2026, 3, 25, 14, 0))
                .endDateTime(LocalDateTime.of(2026, 3, 25, 16, 0))
                .build();
    }

    @Test
    void getBusySlots_ShouldReturnBookingsAndBlocks() {
        // Arrange
        LocalDate date = LocalDate.of(2026, 3, 25);
        when(bookingRepository.findAll()).thenReturn(Arrays.asList(testBooking));
        when(blockRepository.findAll()).thenReturn(Arrays.asList(testBlock));

        // Act
        List<AvailabilityResponse> responses = availabilityService.getBusySlots(1L, date);

        // Assert
        assertThat(responses).hasSize(2);
        assertThat(responses).anyMatch(r -> r.getType().equals("BOOKING") && r.getStart().equals(testBooking.getStartDateTime()));
        assertThat(responses).anyMatch(r -> r.getType().equals("MAINTENANCE") && r.getStart().equals(testBlock.getStartDateTime()));
    }

    @Test
    void getBusySlots_ShouldReturnEmptyList_WhenNoBookingsOrBlocks() {
        // Arrange
        LocalDate date = LocalDate.of(2026, 3, 25);
        when(bookingRepository.findAll()).thenReturn(Collections.emptyList());
        when(blockRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<AvailabilityResponse> responses = availabilityService.getBusySlots(1L, date);

        // Assert
        assertThat(responses).isEmpty();
    }

    @Test
    void getBusySlots_ShouldFilterBySpaceAndDate() {
        // Arrange
        LocalDate date = LocalDate.of(2026, 3, 25);
        Booking otherBooking = Booking.builder()
                .id(2L)
                .space(Space.builder().id(2L).build()) // Different space
                .startDateTime(LocalDateTime.of(2026, 3, 25, 15, 0)) // Different time
                .endDateTime(LocalDateTime.of(2026, 3, 25, 17, 0))
                .status(BookingStatus.CONFIRMED)
                .build();

        when(bookingRepository.findAll()).thenReturn(Arrays.asList(testBooking, otherBooking));
        when(blockRepository.findAll()).thenReturn(Arrays.asList(testBlock));

        // Act
        List<AvailabilityResponse> responses = availabilityService.getBusySlots(1L, date);

        // Assert
        assertThat(responses).hasSize(2); // Only testBooking and testBlock for space 1
        assertThat(responses).noneMatch(r -> r.getType().equals("BOOKING") && r.getStart().equals(otherBooking.getStartDateTime()));
    }

    @Test
    void getBusySlots_ShouldExcludeCancelledBookings() {
        // Arrange
        LocalDate date = LocalDate.of(2026, 3, 25);
        Booking cancelledBooking = Booking.builder()
                .id(2L)
                .space(testSpace)
                .startDateTime(LocalDateTime.of(2026, 3, 25, 13, 0))
                .endDateTime(LocalDateTime.of(2026, 3, 25, 15, 0))
                .status(BookingStatus.CANCELLED)
                .build();

        when(bookingRepository.findAll()).thenReturn(Arrays.asList(testBooking, cancelledBooking));
        when(blockRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<AvailabilityResponse> responses = availabilityService.getBusySlots(1L, date);

        // Assert
        assertThat(responses).hasSize(1); // Only testBooking, cancelled is excluded
        assertThat(responses.get(0).getType()).isEqualTo("BOOKING");
    }
}
