package com.aihub.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "space_amenities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpaceAmenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "space_id", nullable = false)
    private Space space;
}
