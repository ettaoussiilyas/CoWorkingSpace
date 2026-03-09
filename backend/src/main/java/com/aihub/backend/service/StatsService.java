package com.aihub.backend.service;

import com.aihub.backend.dto.ChartDataPoint;
import com.aihub.backend.dto.DashboardStatsResponse;
import com.aihub.backend.entity.Booking;
import com.aihub.backend.entity.BookingStatus;
import com.aihub.backend.repository.BookingRepository;
import com.aihub.backend.repository.SpaceRepository;
import com.aihub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final SpaceRepository spaceRepository;

    public DashboardStatsResponse getDashboardStats() {
        List<Booking> allBookings = bookingRepository.findAll();
        
        // Summary Cards
        Map<String, Number> summary = new HashMap<>();
        summary.put("totalBookings", (long) allBookings.size());
        summary.put("totalUsers", userRepository.count());
        summary.put("activeSpaces", spaceRepository.count());
        
        BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.put("totalRevenue", totalRevenue);

        // Revenue Trend (Last 7 bookings for demo/simplicity, or by date)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        List<ChartDataPoint> revenueTrend = allBookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .sorted(Comparator.comparing(Booking::getCreatedAt))
                .limit(10) // Mocking a trend with the last 10 bookings
                .map(b -> new ChartDataPoint(b.getCreatedAt().format(formatter), b.getTotalPrice()))
                .collect(Collectors.toList());

        // Space Usage (Most popular spaces)
        Map<String, Long> usageMap = allBookings.stream()
                .collect(Collectors.groupingBy(b -> b.getSpace().getName(), Collectors.counting()));
        
        List<ChartDataPoint> spaceUsage = usageMap.entrySet().stream()
                .map(e -> new ChartDataPoint(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(cp -> cp.getValue().longValue(), Comparator.reverseOrder()))
                .limit(5)
                .collect(Collectors.toList());

        // Status Distribution
        Map<BookingStatus, Long> statusMap = allBookings.stream()
                .collect(Collectors.groupingBy(Booking::getStatus, Collectors.counting()));
        
        List<ChartDataPoint> statusDistribution = statusMap.entrySet().stream()
                .map(e -> new ChartDataPoint(e.getKey().name(), e.getValue()))
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .summaryCards(summary)
                .revenueTrend(revenueTrend)
                .spaceUsage(spaceUsage)
                .statusDistribution(statusDistribution)
                .build();
    }
}
