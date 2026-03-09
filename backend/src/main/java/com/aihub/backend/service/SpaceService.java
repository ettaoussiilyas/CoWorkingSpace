package com.aihub.backend.service;

import com.aihub.backend.dto.SpaceRequest;
import com.aihub.backend.dto.SpaceResponse;
import com.aihub.backend.entity.Center;
import com.aihub.backend.entity.Space;
import com.aihub.backend.entity.SpacePhoto;
import com.aihub.backend.entity.SpaceAmenity;
import com.aihub.backend.repository.CenterRepository;
import com.aihub.backend.repository.SpaceRepository;
import com.aihub.backend.repository.SpacePhotoRepository;
import com.aihub.backend.repository.SpaceAmenityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpaceService {

    private final SpaceRepository repository;
    private final CenterRepository centerRepository;
    private final SpacePhotoRepository photoRepository;
    private final SpaceAmenityRepository amenityRepository;

    public List<SpaceResponse> getAllByCenter(Long centerId) {
        return repository.findByCenterId(centerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SpaceResponse getById(Long id) {
        return repository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Space not found"));
    }

    @Transactional
    public SpaceResponse create(SpaceRequest request) {
        Center center = centerRepository.findById(request.getCenterId())
                .orElseThrow(() -> new RuntimeException("Center not found"));

        Space space = Space.builder()
                .name(request.getName())
                .type(request.getType())
                .description(request.getDescription())
                .capacity(request.getCapacity())
                .pricePerHour(request.getPricePerHour())
                .pricePerDay(request.getPricePerDay())
                .center(center)
                .isActive(true)
                .build();

        Space savedSpace = repository.save(space);
        updatePhotosAndAmenities(savedSpace, request);
        return mapToResponse(savedSpace);
    }

    @Transactional
    public SpaceResponse update(Long id, SpaceRequest request) {
        Space space = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Space not found"));

        space.setName(request.getName());
        space.setType(request.getType());
        space.setDescription(request.getDescription());
        space.setCapacity(request.getCapacity());
        space.setPricePerHour(request.getPricePerHour());
        space.setPricePerDay(request.getPricePerDay());

        updatePhotosAndAmenities(space, request);
        return mapToResponse(repository.save(space));
    }

    @Transactional
    public void delete(Long id) {
        Space space = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Space not found"));
        repository.delete(space);
    }

    private void updatePhotosAndAmenities(Space space, SpaceRequest request) {
        // Clear existing
        if (space.getPhotos() != null) {
            photoRepository.deleteAll(space.getPhotos());
        }
        if (space.getAmenities() != null) {
            amenityRepository.deleteAll(space.getAmenities());
        }

        // Add new photos
        if (request.getPhotos() != null) {
            List<SpacePhoto> photos = request.getPhotos().stream()
                    .map(url -> SpacePhoto.builder()
                            .photoUrl(url)
                            .space(space)
                            .build())
                    .collect(Collectors.toList());
            photoRepository.saveAll(photos);
            space.setPhotos(photos);
        }

        // Add new amenities
        if (request.getAmenities() != null) {
            List<SpaceAmenity> amenities = request.getAmenities().stream()
                    .map(name -> SpaceAmenity.builder()
                            .name(name)
                            .space(space)
                            .build())
                    .collect(Collectors.toList());
            amenityRepository.saveAll(amenities);
            space.setAmenities(amenities);
        }
    }

    private SpaceResponse mapToResponse(Space space) {
        return SpaceResponse.builder()
                .id(space.getId())
                .name(space.getName())
                .type(space.getType())
                .description(space.getDescription())
                .capacity(space.getCapacity())
                .pricePerHour(space.getPricePerHour())
                .pricePerDay(space.getPricePerDay())
                .centerId(space.getCenter().getId())
                .averageRating(space.getAverageRating() != null ? space.getAverageRating() : 0.0)
                .photos(space.getPhotos() != null ? 
                        space.getPhotos().stream().map(SpacePhoto::getPhotoUrl).collect(Collectors.toList()) : 
                        List.of())
                .amenities(space.getAmenities() != null ? 
                        space.getAmenities().stream().map(SpaceAmenity::getName).collect(Collectors.toList()) : 
                        List.of())
                .build();
    }
}
