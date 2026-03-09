package com.aihub.backend.dto;

import com.aihub.backend.entity.SpaceType;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpaceResponse {
    private Long id;
    private String name;
    private SpaceType type;
    private String description;
    private Integer capacity;
    private BigDecimal pricePerHour;
    private BigDecimal pricePerDay;
    private Long centerId;
    private Double averageRating;
    private java.util.List<String> photos;
    private java.util.List<String> amenities;
}
