package com.aihub.backend.service;

import com.aihub.backend.dto.CenterRequest;
import com.aihub.backend.dto.CenterResponse;
import com.aihub.backend.entity.Center;
import com.aihub.backend.entity.CenterPhoto;
import com.aihub.backend.repository.CenterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CenterServiceTest {

    @Mock
    private CenterRepository centerRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private CenterService centerService;

    private Center testCenter;
    private CenterRequest centerRequest;
    private MockMultipartFile mockImage;

    @BeforeEach
    void setUp() {
        CenterPhoto photo = CenterPhoto.builder()
                .photoUrl("http://example.com/photo.jpg")
                .displayOrder(0)
                .build();

        testCenter = Center.builder()
                .id(1L)
                .name("Test Center")
                .city("Test City")
                .address("Test Address")
                .description("Test Description")
                .phone("123456789")
                .email("test@example.com")
                .openingHours("08:00-18:00")
                .isActive(true)
                .photos(Arrays.asList(photo))
                .build();

        centerRequest = CenterRequest.builder()
                .name("Test Center")
                .city("Test City")
                .address("Test Address")
                .description("Test Description")
                .phone("123456789")
                .email("test@example.com")
                .openingHours("08:00-18:00")
                .build();

        mockImage = new MockMultipartFile("image", "test.jpg", "image/jpeg", "test image content".getBytes());
    }

    @Test
    void getAllActive_ShouldReturnActiveCenters() {
        // Arrange
        when(centerRepository.findByIsActiveTrue()).thenReturn(Arrays.asList(testCenter));

        // Act
        List<CenterResponse> responses = centerService.getAllActive();

        // Assert
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getName()).isEqualTo("Test Center");
        verify(centerRepository).findByIsActiveTrue();
    }

    @Test
    void getById_ShouldReturnCenter_WhenExists() {
        // Arrange
        when(centerRepository.findById(1L)).thenReturn(Optional.of(testCenter));

        // Act
        CenterResponse response = centerService.getById(1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Test Center");
        verify(centerRepository).findById(1L);
    }

    @Test
    void getById_ShouldThrowException_WhenNotFound() {
        // Arrange
        when(centerRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> centerService.getById(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Center not found");
        verify(centerRepository).findById(1L);
    }

    @Test
    void create_ShouldCreateCenter_WithoutImage() throws IOException {
        // Arrange
        when(centerRepository.save(any(Center.class))).thenReturn(testCenter);

        // Act
        CenterResponse response = centerService.create(centerRequest, null);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Test Center");
        verify(centerRepository).save(any(Center.class));
        verify(cloudinaryService, never()).uploadImage(any());
    }

    @Test
    void create_ShouldCreateCenter_WithImage() throws IOException {
        // Arrange
        when(cloudinaryService.uploadImage(mockImage)).thenReturn("http://cloudinary.com/image.jpg");
        when(centerRepository.save(any(Center.class))).thenReturn(testCenter);

        // Act
        CenterResponse response = centerService.create(centerRequest, mockImage);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Test Center");
        verify(cloudinaryService).uploadImage(mockImage);
        verify(centerRepository).save(any(Center.class));
    }

    @Test
    void create_ShouldThrowException_WhenImageUploadFails() throws IOException {
        // Arrange
        when(cloudinaryService.uploadImage(mockImage)).thenThrow(new IOException("Upload failed"));

        // Act & Assert
        assertThatThrownBy(() -> centerService.create(centerRequest, mockImage))
                .isInstanceOf(IOException.class)
                .hasMessage("Upload failed");
        verify(cloudinaryService).uploadImage(mockImage);
        verify(centerRepository, never()).save(any(Center.class));
    }
}
