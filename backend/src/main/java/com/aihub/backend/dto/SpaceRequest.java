package com.aihub.backend.dto;

import com.aihub.backend.entity.SpaceType;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpaceRequest {
    private String name;
    private SpaceType type;
    private String description;
    private Integer capacity;
    private BigDecimal pricePerHour;
    private BigDecimal pricePerDay;
    private List<String> photos;
    private List<String> amenities;
    private Long centerId;
}
