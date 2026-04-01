package com.aihub.backend.service;

import com.aihub.backend.dto.BookingRequest;
import com.aihub.backend.dto.BookingResponse;
import com.aihub.backend.entity.Booking;
import com.aihub.backend.entity.BookingStatus;
import com.aihub.backend.entity.Space;
import com.aihub.backend.entity.User;
import com.aihub.backend.repository.AvailabilityBlockRepository;
import com.aihub.backend.repository.BookingRepository;
import com.aihub.backend.repository.ReviewRepository;
import com.aihub.backend.repository.SpaceRepository;
import com.aihub.backend.repository.UserRepository;
import com.aihub.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository repository;
    private final SpaceRepository spaceRepository;
    private final UserRepository userRepository;
    private final AvailabilityBlockRepository availabilityBlockRepository;
    private final ReviewRepository reviewRepository;
    private final EmailService emailService;

    @Transactional
    public BookingResponse create(BookingRequest request, Long userId) {
        // 1. Check Booking conflicts
        long overlapCount = repository.countOverlappingBookings(
                request.getSpaceId(), request.getStartDateTime(), request.getEndDateTime());
        
        if (overlapCount > 0) {
            throw new RuntimeException("booking.conflict.existing_booking");
        }

        // 2. Check AvailabilityBlock conflicts (Maintenance, etc.)
        List<com.aihub.backend.entity.AvailabilityBlock> maintenanceBlocks = 
                availabilityBlockRepository.findOverlappingBlocks(
                    request.getSpaceId(), request.getStartDateTime(), request.getEndDateTime());
        
        if (!maintenanceBlocks.isEmpty()) {
            throw new RuntimeException("booking.conflict.maintenance");
        }

        Space space = spaceRepository.findById(request.getSpaceId())
                .orElseThrow(() -> new RuntimeException("Space not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Calculate price
        BigDecimal totalPrice = calculatePrice(space, request);

        Booking booking = Booking.builder()
                .user(user)
                .space(space)
                .startDateTime(request.getStartDateTime())
                .endDateTime(request.getEndDateTime())
                .totalPrice(totalPrice)
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = repository.save(booking);
        
        emailService.sendBookingConfirmation(
                saved.getUser().getEmail(),
                saved.getSpace().getName(),
                saved.getStartDateTime().toString()
        );
        
        return mapToResponse(saved);
    }

    public List<BookingResponse> getUserBookings(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByMonth(int year, int month) {
        return repository.findByYearAndMonth(year, month).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse updateStatus(Long id, String status) {
        Booking booking = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.valueOf(status));
        return mapToResponse(repository.save(booking));
    }

    private BigDecimal calculatePrice(Space space, BookingRequest request) {
        long hours = Duration.between(request.getStartDateTime(), request.getEndDateTime()).toHours();
        if (hours <= 0) hours = 1; // Minimum 1 hour
        return space.getPricePerHour().multiply(new BigDecimal(hours));
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .spaceName(booking.getSpace().getName())
                .centerName(booking.getSpace().getCenter().getName())
                .userName(booking.getUser().getFullName())
                .userEmail(booking.getUser().getEmail())
                .startDateTime(booking.getStartDateTime())
                .endDateTime(booking.getEndDateTime())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .paymentMethod(booking.getPaymentMethod())
                .paymentStatus(booking.getPaymentStatus())
                .hasReview(reviewRepository.existsByBookingId(booking.getId()))
                .build();
    }
}
