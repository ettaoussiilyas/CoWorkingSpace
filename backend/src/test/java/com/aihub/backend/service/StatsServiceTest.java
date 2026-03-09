package com.aihub.backend.service;

import com.aihub.backend.dto.ChartDataPoint;
import com.aihub.backend.dto.DashboardStatsResponse;
import com.aihub.backend.entity.*;
import com.aihub.backend.repository.BookingRepository;
import com.aihub.backend.repository.SpaceRepository;
import com.aihub.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatsServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SpaceRepository spaceRepository;

    @InjectMocks
    private StatsService statsService;

    private Booking booking1;
    private Booking booking2;
    private Space space1;
    private Space space2;
    private User user1;

    @BeforeEach
    void setUp() {
        user1 = User.builder()
                .id(1L)
                .email("user@example.com")
                .build();

        space1 = Space.builder()
                .id(1L)
                .name("Space A")
                .build();

        space2 = Space.builder()
                .id(2L)
                .name("Space B")
                .build();

        booking1 = Booking.builder()
                .id(1L)
                .user(user1)
                .space(space1)
                .status(BookingStatus.CONFIRMED)
                .totalPrice(new BigDecimal("100.00"))
                .createdAt(LocalDateTime.of(2026, 3, 25, 10, 0))
                .build();

        booking2 = Booking.builder()
                .id(2L)
                .user(user1)
                .space(space2)
                .status(BookingStatus.CANCELLED)
                .totalPrice(new BigDecimal("200.00"))
                .createdAt(LocalDateTime.of(2026, 3, 26, 10, 0))
                .build();
    }

    @Test
    void getDashboardStats_ShouldReturnCorrectStats() {
        // Arrange
        when(bookingRepository.findAll()).thenReturn(Arrays.asList(booking1, booking2));
        when(userRepository.count()).thenReturn(5L);
        when(spaceRepository.count()).thenReturn(3L);

        // Act
        DashboardStatsResponse response = statsService.getDashboardStats();

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getSummaryCards()).isNotNull();
        assertThat(response.getSummaryCards().get("totalBookings")).isEqualTo(2L);
        assertThat(response.getSummaryCards().get("totalUsers")).isEqualTo(5L);
        assertThat(response.getSummaryCards().get("activeSpaces")).isEqualTo(3L);
        assertThat(response.getSummaryCards().get("totalRevenue")).isEqualTo(new BigDecimal("100.00")); // Only confirmed

        assertThat(response.getRevenueTrend()).hasSize(1); // Only confirmed booking
        assertThat(response.getSpaceUsage()).hasSize(2); // Two spaces
        assertThat(response.getStatusDistribution()).hasSize(2); // CONFIRMED and CANCELLED
    }

    @Test
    void getDashboardStats_ShouldHandleEmptyBookings() {
        // Arrange
        when(bookingRepository.findAll()).thenReturn(List.of());
        when(userRepository.count()).thenReturn(0L);
        when(spaceRepository.count()).thenReturn(0L);

        // Act
        DashboardStatsResponse response = statsService.getDashboardStats();

        // Assert
        assertThat(response.getSummaryCards().get("totalBookings")).isEqualTo(0L);
        assertThat(response.getSummaryCards().get("totalRevenue")).isEqualTo(BigDecimal.ZERO);
        assertThat(response.getRevenueTrend()).isEmpty();
        assertThat(response.getSpaceUsage()).isEmpty();
        assertThat(response.getStatusDistribution()).isEmpty();
    }

    @Test
    void getDashboardStats_ShouldCalculateRevenueOnlyForConfirmedAndCompleted() {
        // Arrange
        Booking completedBooking = Booking.builder()
                .id(3L)
                .user(user1)
                .space(space1)
                .status(BookingStatus.COMPLETED)
                .totalPrice(new BigDecimal("150.00"))
                .createdAt(LocalDateTime.of(2026, 3, 27, 10, 0))
                .build();

        when(bookingRepository.findAll()).thenReturn(Arrays.asList(booking1, booking2, completedBooking));
        when(userRepository.count()).thenReturn(1L);
        when(spaceRepository.count()).thenReturn(1L);

        // Act
        DashboardStatsResponse response = statsService.getDashboardStats();

        // Assert
        assertThat(response.getSummaryCards().get("totalRevenue")).isEqualTo(new BigDecimal("250.00")); // 100 + 150
    }

    @Test
    void getDashboardStats_ShouldLimitRevenueTrendTo10() {
        // Arrange
        Booking b1 = Booking.builder().id(1L).user(user1).space(space1).status(BookingStatus.CONFIRMED).totalPrice(new BigDecimal("10.00")).createdAt(LocalDateTime.of(2026, 3, 20, 10, 0)).build();
        Booking b2 = Booking.builder().id(2L).user(user1).space(space1).status(BookingStatus.CONFIRMED).totalPrice(new BigDecimal("10.00")).createdAt(LocalDateTime.of(2026, 3, 21, 10, 0)).build();
        Booking b3 = Booking.builder().id(3L).user(user1).space(space1).status(BookingStatus.CONFIRMED).totalPrice(new BigDecimal("10.00")).createdAt(LocalDateTime.of(2026, 3, 22, 10, 0)).build();
        Booking b4 = Booking.builder().id(4L).user(user1).space(space1).status(BookingStatus.CONFIRMED).totalPrice(new BigDecimal("10.00")).createdAt(LocalDateTime.of(2026, 3, 23, 10, 0)).build();
        Booking b5 = Booking.builder().id(5L).user(user1).space(space1).status(BookingStatus.CONFIRMED).totalPrice(new BigDecimal("10.00")).createdAt(LocalDateTime.of(2026, 3, 24, 10, 0)).build();
        Booking b6 = Booking.builder().id(6L).user(user1).space(space1).status(BookingStatus.CONFIRMED).totalPrice(new BigDecimal("10.00")).createdAt(LocalDateTime.of(2026, 3, 25, 10, 0)).build();
        Booking b7 = Booking.builder().id(7L).user(user1).space(space1).status(BookingStatus.CONFIRMED).totalPrice(new BigDecimal("10.00")).createdAt(LocalDateTime.of(2026, 3, 26, 10, 0)).build();
        Booking b8 = Booking.builder().id(8L).user(user1).space(space1).status(BookingStatus.CONFIRMED).totalPrice(new BigDecimal("10.00")).createdAt(LocalDateTime.of(2026, 3, 27, 10, 0)).build();
        Booking b9 = Booking.builder().id(9L).user(user1).space(space1).status(BookingStatus.CONFIRMED).totalPrice(new BigDecimal("10.00")).createdAt(LocalDateTime.of(2026, 3, 28, 10, 0)).build();
        Booking b10 = Booking.builder().id(10L).user(user1).space(space1).status(BookingStatus.CONFIRMED).totalPrice(new BigDecimal("10.00")).createdAt(LocalDateTime.of(2026, 3, 29, 10, 0)).build();
        Booking b11 = Booking.builder().id(11L).user(user1).space(space1).status(BookingStatus.CONFIRMED).totalPrice(new BigDecimal("10.00")).createdAt(LocalDateTime.of(2026, 3, 30, 10, 0)).build();

        List<Booking> manyBookings = Arrays.asList(b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11);
        when(bookingRepository.findAll()).thenReturn(manyBookings);
        when(userRepository.count()).thenReturn(1L);
        when(spaceRepository.count()).thenReturn(1L);

        // Act
        DashboardStatsResponse response = statsService.getDashboardStats();

        // Assert
        assertThat(response.getRevenueTrend()).hasSize(10); // Limited to 10
    }
}
