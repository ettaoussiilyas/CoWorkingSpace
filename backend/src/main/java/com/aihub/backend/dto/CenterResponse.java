package com.aihub.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CenterResponse {
    private Long centerId;
    private String name;
    private Double averageRating;
    private String city;
    private String address;
    private String description;
    private String phone;
    private String email;
    private String openingHours;
    private java.util.List<String> photos;
    private java.util.List<String> amenities;
}
