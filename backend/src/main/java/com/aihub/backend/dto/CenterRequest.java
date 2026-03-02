package com.aihub.backend.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CenterRequest {
    private String name;
    private String city;
    private String address;
    private String description;
    private String phone;
    private String email;
    private String openingHours;
}
