package com.aihub.backend.service;

import com.aihub.backend.dto.CenterRequest;
import com.aihub.backend.dto.CenterResponse;
import com.aihub.backend.entity.Center;
import com.aihub.backend.entity.CenterPhoto;
import com.aihub.backend.repository.CenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CenterService {

    private final CenterRepository repository;
    private final CloudinaryService cloudinaryService;

    public List<CenterResponse> getAllActive() {
        return repository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CenterResponse getById(Long id) {
        return repository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Center not found"));
    }

    public CenterResponse create(CenterRequest request, MultipartFile image) throws IOException {
        Center center = Center.builder()
                .name(request.getName())
                .city(request.getCity())
                .address(request.getAddress())
                .description(request.getDescription())
                .phone(request.getPhone())
                .email(request.getEmail())
                .openingHours(request.getOpeningHours())
                .build();
        
        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image);
            CenterPhoto photo = CenterPhoto.builder()
                    .photoUrl(imageUrl)
                    .displayOrder(0)
                    .center(center)
                    .build();
            center.setPhotos(List.of(photo));
        }

        return mapToResponse(repository.save(center));
    }

    private CenterResponse mapToResponse(Center center) {
        return CenterResponse.builder()
                .centerId(center.getId())
                .name(center.getName())
                .city(center.getCity())
                .address(center.getAddress())
                .description(center.getDescription())
                .phone(center.getPhone())
                .email(center.getEmail())
                .openingHours(center.getOpeningHours())
                .photos(center.getPhotos() != null ? 
                        center.getPhotos().stream().map(CenterPhoto::getPhotoUrl).collect(Collectors.toList()) : 
                        List.of())
                .build();
    }
}
