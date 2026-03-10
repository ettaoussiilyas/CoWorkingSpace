package com.aihub.backend.service;

import com.aihub.backend.dto.AvailabilityResponse;
import com.aihub.backend.entity.AvailabilityBlock;
import com.aihub.backend.entity.Booking;
import com.aihub.backend.repository.AvailabilityBlockRepository;
import com.aihub.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final BookingRepository bookingRepository;
    private final AvailabilityBlockRepository blockRepository;

    public List<AvailabilityResponse> getBusySlots(Long spaceId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        // 1. Get Bookings
        List<Booking> bookings = bookingRepository.findAll().stream() // Ideally we add a query for this
                .filter(b -> b.getSpace().getId().equals(spaceId) && 
                        !b.getStatus().toString().equals("CANCELLED") &&
                        b.getStartDateTime().isBefore(endOfDay) && 
                        b.getEndDateTime().isAfter(startOfDay))
                .toList();

        // 2. Get Blocks
        List<AvailabilityBlock> blocks = blockRepository.findAll().stream()
                .filter(b -> b.getSpace().getId().equals(spaceId) &&
                        b.getStartDateTime().isBefore(endOfDay) &&
                        b.getEndDateTime().isAfter(startOfDay))
                .toList();

        List<AvailabilityResponse> response = new ArrayList<>();
        
        bookings.forEach(b -> response.add(AvailabilityResponse.builder()
                .start(b.getStartDateTime())
                .end(b.getEndDateTime())
                .type("BOOKING")
                .build()));

        blocks.forEach(b -> response.add(AvailabilityResponse.builder()
                .start(b.getStartDateTime())
                .end(b.getEndDateTime())
                .type("MAINTENANCE")
                .build()));

        return response;
    }
}
