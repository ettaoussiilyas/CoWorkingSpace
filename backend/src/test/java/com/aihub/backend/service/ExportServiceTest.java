package com.aihub.backend.service;

import com.aihub.backend.entity.*;
import com.aihub.backend.repository.BookingRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExportServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private ExportService exportService;

    private Booking testBooking;

    @BeforeEach
    void setUp() {
        User testUser = User.builder()
                .id(1L)
                .email("user@example.com")
                .build();

        Space testSpace = Space.builder()
                .id(1L)
                .name("Test Space")
                .build();

        testBooking = Booking.builder()
                .id(1L)
                .user(testUser)
                .space(testSpace)
                .startDateTime(LocalDateTime.of(2026, 3, 25, 10, 0))
                .endDateTime(LocalDateTime.of(2026, 3, 25, 12, 0))
                .status(BookingStatus.CONFIRMED)
                .totalPrice(new BigDecimal("100.00"))
                .build();
    }

    @Test
    void exportBookingsToCsv_ShouldReturnCsvString_WhenBookingsExist() {
        // Arrange
        when(bookingRepository.findAll()).thenReturn(Arrays.asList(testBooking));

        // Act
        String csv = exportService.exportBookingsToCsv();

        // Assert
        assertThat(csv).isNotNull();
        assertThat(csv).contains("\"ID\",\"User\",\"Space\",\"Start\",\"End\",\"Status\",\"Price\"");
        assertThat(csv).contains("\"1\",\"user@example.com\",\"Test Space\",\"2026-03-25T10:00\",\"2026-03-25T12:00\",\"CONFIRMED\",\"100.00\"");
    }

    @Test
    void exportBookingsToCsv_ShouldReturnCsvWithHeaderOnly_WhenNoBookings() {
        // Arrange
        when(bookingRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        String csv = exportService.exportBookingsToCsv();

        // Assert
        assertThat(csv).isNotNull();
        assertThat(csv).contains("\"ID\",\"User\",\"Space\",\"Start\",\"End\",\"Status\",\"Price\"");
        assertThat(csv.split("\n")).hasSize(1); // Only header
    }

    @Test
    void exportBookingsToCsv_ShouldHandleMultipleBookings() {
        // Arrange
        Booking anotherBooking = Booking.builder()
                .id(2L)
                .user(User.builder().email("user2@example.com").build())
                .space(Space.builder().name("Another Space").build())
                .startDateTime(LocalDateTime.of(2026, 3, 26, 14, 0))
                .endDateTime(LocalDateTime.of(2026, 3, 26, 16, 0))
                .status(BookingStatus.PENDING)
                .totalPrice(new BigDecimal("200.00"))
                .build();

        when(bookingRepository.findAll()).thenReturn(Arrays.asList(testBooking, anotherBooking));

        // Act
        String csv = exportService.exportBookingsToCsv();

        // Assert
        assertThat(csv).contains("\"ID\",\"User\",\"Space\",\"Start\",\"End\",\"Status\",\"Price\"");
        assertThat(csv).contains("\"1\",\"user@example.com\",\"Test Space\"");
        assertThat(csv).contains("\"2\",\"user2@example.com\",\"Another Space\"");
        assertThat(csv.split("\n")).hasSize(3); // Header + 2 rows
    }
}
