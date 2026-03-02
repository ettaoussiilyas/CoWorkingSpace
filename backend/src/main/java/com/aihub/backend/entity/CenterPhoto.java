package com.aihub.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "center_photos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CenterPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "photo_url", nullable = false)
    private String photoUrl;

    @Column(name = "display_order")
    private Integer displayOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "center_id", nullable = false)
    private Center center;
}
