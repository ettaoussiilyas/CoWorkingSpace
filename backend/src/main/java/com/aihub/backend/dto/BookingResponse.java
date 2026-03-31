package com.aihub.backend.dto;

import com.aihub.backend.entity.BookingStatus;
import com.aihub.backend.entity.PaymentMethod;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String spaceName;
    private String centerName;
    private String userName;
    private String userEmail;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private PaymentMethod paymentMethod;
    private String paymentStatus;
    private boolean hasReview;
}
