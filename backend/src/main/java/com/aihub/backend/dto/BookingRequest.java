package com.aihub.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    private Long spaceId;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
}
