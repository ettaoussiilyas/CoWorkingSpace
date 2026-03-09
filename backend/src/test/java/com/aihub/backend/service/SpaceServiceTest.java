package com.aihub.backend.service;

import com.aihub.backend.dto.SpaceRequest;
import com.aihub.backend.dto.SpaceResponse;
import com.aihub.backend.entity.*;
import com.aihub.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SpaceServiceTest {

    @Mock
    private SpaceRepository spaceRepository;

    @Mock
    private CenterRepository centerRepository;

    @Mock
    private SpacePhotoRepository photoRepository;

    @Mock
    private SpaceAmenityRepository amenityRepository;

    @InjectMocks
    private SpaceService spaceService;

    private Center testCenter;
    private Space testSpace;
    private SpaceRequest spaceRequest;
    private SpacePhoto spacePhoto;
    private SpaceAmenity spaceAmenity;

    @BeforeEach
    void setUp() {
        testCenter = Center.builder()
                .id(1L)
                .name("Test Center")
                .build();

        spacePhoto = SpacePhoto.builder()
                .id(1L)
                .photoUrl("http://example.com/photo.jpg")
                .build();

        spaceAmenity = SpaceAmenity.builder()
                .id(1L)
                .name("WiFi")
                .build();

        testSpace = Space.builder()
                .id(1L)
                .name("Test Space")
                .type(SpaceType.CONFERENCE_ROOM)
                .description("Test description")
                .capacity(10)
                .pricePerHour(new BigDecimal("50.00"))
                .pricePerDay(new BigDecimal("400.00"))
                .center(testCenter)
                .isActive(true)
                .photos(Arrays.asList(spacePhoto))
                .amenities(Arrays.asList(spaceAmenity))
                .averageRating(4.5)
                .build();

        spaceRequest = SpaceRequest.builder()
                .name("Test Space")
                .type(SpaceType.CONFERENCE_ROOM)
                .description("Test description")
                .capacity(10)
                .pricePerHour(new BigDecimal("50.00"))
                .pricePerDay(new BigDecimal("400.00"))
                .centerId(1L)
                .photos(Arrays.asList("http://example.com/photo.jpg"))
                .amenities(Arrays.asList("WiFi"))
                .build();
    }

    @Test
    void getAllByCenter_ShouldReturnListOfSpaces() {
        // Arrange
        when(spaceRepository.findByCenterId(anyLong())).thenReturn(Arrays.asList(testSpace));

        // Act
        List<SpaceResponse> responses = spaceService.getAllByCenter(1L);

        // Assert
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getId()).isEqualTo(1L);
        assertThat(responses.get(0).getName()).isEqualTo("Test Space");
        verify(spaceRepository).findByCenterId(1L);
    }

    @Test
    void getAllByCenter_ShouldReturnEmptyList_WhenNoCentersFound() {
        // Arrange
        when(spaceRepository.findByCenterId(anyLong())).thenReturn(Collections.emptyList());

        // Act
        List<SpaceResponse> responses = spaceService.getAllByCenter(1L);

        // Assert
        assertThat(responses).isEmpty();
        verify(spaceRepository).findByCenterId(1L);
    }

    @Test
    void getById_ShouldReturnSpace_WhenSpaceExists() {
        // Arrange
        when(spaceRepository.findById(anyLong())).thenReturn(Optional.of(testSpace));

        // Act
        SpaceResponse response = spaceService.getById(1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Test Space");
        assertThat(response.getType()).isEqualTo(SpaceType.CONFERENCE_ROOM);
        assertThat(response.getCapacity()).isEqualTo(10);
        assertThat(response.getPricePerHour()).isEqualTo(new BigDecimal("50.00"));
        assertThat(response.getPricePerDay()).isEqualTo(new BigDecimal("400.00"));
        assertThat(response.getAverageRating()).isEqualTo(4.5);
        verify(spaceRepository).findById(1L);
    }

    @Test
    void getById_ShouldThrowException_WhenSpaceNotFound() {
        // Arrange
        when(spaceRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> spaceService.getById(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Space not found");
        verify(spaceRepository).findById(1L);
    }

    @Test
    void create_ShouldCreateSpace_WhenCenterExists() {
        // Arrange
        when(centerRepository.findById(anyLong())).thenReturn(Optional.of(testCenter));
        when(spaceRepository.save(any(Space.class))).thenReturn(testSpace);
        when(photoRepository.saveAll(anyList())).thenReturn(Arrays.asList(spacePhoto));
        when(amenityRepository.saveAll(anyList())).thenReturn(Arrays.asList(spaceAmenity));

        // Act
        SpaceResponse response = spaceService.create(spaceRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Test Space");
        assertThat(response.getType()).isEqualTo(SpaceType.CONFERENCE_ROOM);
        verify(centerRepository).findById(1L);
        verify(spaceRepository).save(any(Space.class));
        verify(photoRepository).saveAll(anyList());
        verify(amenityRepository).saveAll(anyList());
    }

    @Test
    void create_ShouldThrowException_WhenCenterNotFound() {
        // Arrange
        when(centerRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> spaceService.create(spaceRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Center not found");
        verify(centerRepository).findById(1L);
        verify(spaceRepository, never()).save(any(Space.class));
    }

    @Test
    void create_ShouldSetIsActiveToTrue() {
        // Arrange
        when(centerRepository.findById(anyLong())).thenReturn(Optional.of(testCenter));
        when(spaceRepository.save(any(Space.class))).thenAnswer(invocation -> {
            Space space = invocation.getArgument(0);
            assertThat(space.getIsActive()).isTrue();
            return testSpace;
        });
        when(photoRepository.saveAll(anyList())).thenReturn(Arrays.asList(spacePhoto));
        when(amenityRepository.saveAll(anyList())).thenReturn(Arrays.asList(spaceAmenity));

        // Act
        spaceService.create(spaceRequest);

        // Assert
        verify(spaceRepository).save(any(Space.class));
    }

    @Test
    void update_ShouldUpdateSpace_WhenSpaceExists() {
        // Arrange
        when(spaceRepository.findById(anyLong())).thenReturn(Optional.of(testSpace));
        when(spaceRepository.save(any(Space.class))).thenReturn(testSpace);
        doNothing().when(photoRepository).deleteAll(anyList());
        doNothing().when(amenityRepository).deleteAll(anyList());

        SpaceRequest updateRequest = SpaceRequest.builder()
                .name("Updated Space")
                .type(SpaceType.PRIVATE_OFFICE)
                .description("Updated description")
                .capacity(20)
                .pricePerHour(new BigDecimal("60.00"))
                .pricePerDay(new BigDecimal("500.00"))
                .centerId(1L)
                .build();

        // Act
        SpaceResponse response = spaceService.update(1L, updateRequest);

        // Assert
        assertThat(response).isNotNull();
        verify(spaceRepository).findById(1L);
        verify(spaceRepository).save(any(Space.class));
        verify(photoRepository).deleteAll(anyList());
        verify(amenityRepository).deleteAll(anyList());
    }

    @Test
    void update_ShouldThrowException_WhenSpaceNotFound() {
        // Arrange
        when(spaceRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> spaceService.update(1L, spaceRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Space not found");
        verify(spaceRepository).findById(1L);
        verify(spaceRepository, never()).save(any(Space.class));
    }

    @Test
    void delete_ShouldDeleteSpace_WhenSpaceExists() {
        // Arrange
        when(spaceRepository.findById(anyLong())).thenReturn(Optional.of(testSpace));
        doNothing().when(spaceRepository).delete(any(Space.class));

        // Act
        spaceService.delete(1L);

        // Assert
        verify(spaceRepository).findById(1L);
        verify(spaceRepository).delete(testSpace);
    }

    @Test
    void delete_ShouldThrowException_WhenSpaceNotFound() {
        // Arrange
        when(spaceRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> spaceService.delete(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Space not found");
        verify(spaceRepository).findById(1L);
        verify(spaceRepository, never()).delete(any(Space.class));
    }

    @Test
    void mapToResponse_ShouldHandleNullPhotosAndAmenities() {
        // Arrange
        Space spaceWithoutPhotosAndAmenities = Space.builder()
                .id(1L)
                .name("Test Space")
                .type(SpaceType.CONFERENCE_ROOM)
                .capacity(10)
                .pricePerHour(new BigDecimal("50.00"))
                .pricePerDay(new BigDecimal("400.00"))
                .center(testCenter)
                .photos(null)
                .amenities(null)
                .build();

        when(spaceRepository.findById(anyLong())).thenReturn(Optional.of(spaceWithoutPhotosAndAmenities));

        // Act
        SpaceResponse response = spaceService.getById(1L);

        // Assert
        assertThat(response.getPhotos()).isEmpty();
        assertThat(response.getAmenities()).isEmpty();
    }

    @Test
    void mapToResponse_ShouldHandleNullAverageRating() {
        // Arrange
        Space spaceWithoutRating = Space.builder()
                .id(1L)
                .name("Test Space")
                .type(SpaceType.CONFERENCE_ROOM)
                .capacity(10)
                .pricePerHour(new BigDecimal("50.00"))
                .pricePerDay(new BigDecimal("400.00"))
                .center(testCenter)
                .averageRating(null)
                .build();

        when(spaceRepository.findById(anyLong())).thenReturn(Optional.of(spaceWithoutRating));

        // Act
        SpaceResponse response = spaceService.getById(1L);

        // Assert
        assertThat(response.getAverageRating()).isEqualTo(0.0);
    }
}
